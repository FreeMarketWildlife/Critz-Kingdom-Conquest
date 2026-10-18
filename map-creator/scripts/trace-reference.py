"""Trace the supplied flat-color reference into editable polygons and brush stamps.
No generated or background image is used by the editor. Requires Pillow + numpy.
Usage: python trace-reference.py SOURCE_PNG OUTPUT_MJS
"""
from PIL import Image
import numpy as np
import json,sys,math,hashlib
from collections import defaultdict
from pathlib import Path
source=Path(sys.argv[1]); output=Path(sys.argv[2]); crop=(13,15,689,691)
a=np.asarray(Image.open(source).convert('RGB').crop(crop)).astype(np.int32)
# Palette sampled from dominant interior colors, not guessed geometry.
colors=[(0,0,0),(145,153,112),(16,24,19),(19,156,197),(34,177,76),(101,137,142),(115,151,159),(99,138,140),(115,150,156),(90,130,132),(82,121,132),(63,107,142),(126,92,104)]
labels=np.argmin(np.stack([np.sum((a-np.array(c))**2,axis=2) for c in colors]),axis=0)
size=676; scale=1000/size

def area(p):return sum(x*q[1]-q[0]*y for (x,y),q in zip(p,p[1:]+p[:1]))/2

def distance(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1]
 if dx==dy==0:return math.hypot(p[0]-a[0],p[1]-a[1])
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

def rdp(p,e):
 if len(p)<3:return p
 distances=[distance(q,p[0],p[-1]) for q in p[1:-1]]
 m=max(distances,default=0)
 if m<=e:return [p[0],p[-1]]
 i=distances.index(m)+1
 return rdp(p[:i+1],e)[:-1]+rdp(p[i:],e)

def simplify(p,e=.55):
 i=max(range(len(p)),key=lambda j:(p[j][0]-p[0][0])**2+(p[j][1]-p[0][1])**2)
 return rdp(p[:i+1],e)[:-1]+rdp(p[i:]+[p[0]],e)[:-1]

def contours(mask,min_area=4):
 edges=defaultdict(list)
 ys,xs=np.nonzero(mask)
 for y,x in zip(ys.tolist(),xs.tolist()):
  if y==0 or not mask[y-1,x]:edges[(x,y)].append((x+1,y))
  if x==size-1 or not mask[y,x+1]:edges[(x+1,y)].append((x+1,y+1))
  if y==size-1 or not mask[y+1,x]:edges[(x+1,y+1)].append((x,y+1))
  if x==0 or not mask[y,x-1]:edges[(x,y+1)].append((x,y))
 paths=[]
 while edges:
  start=next(iter(edges));p=[start];cur=start
  while True:
   choices=edges[cur];nxt=choices.pop()
   if not choices:del edges[cur]
   if nxt==start:break
   p.append(nxt);cur=nxt
   if cur not in edges:raise ValueError('Open trace boundary')
  if len(p)>=3 and area(p)>=min_area:
   s=simplify(p)
   if len(s)>=3 and area(s)>=3:paths.append(s)
 return paths
geometry=[]; stats={};count=0
# A unified base-ground underlay keeps adjacent, independently simplified detail
# contours from exposing black hairline seams. Detail polygons remain editable.
yy,xx=np.indices(labels.shape)
base_mask=(labels>=5)&(((xx>380)&(yy<300))|((xx<300)&(yy>380)))
for p in contours(base_mask,2000):
 epsilon=.7
 while len(p)>200:p=simplify(p,epsilon);epsilon*=1.2
 count+=1
 geometry.append({'id':f'ref-base-ground-{count}','type':'base','team':'red' if sum(x for x,y in p)>sum(y for x,y in p) else 'blue','fill':'#65898e','width':1,'label':'Traced base-ground area','points':[[round(x*scale,5),round(y*scale,5)] for x,y in p]})
for index,color in enumerate(colors):
 if index in (0,4):continue
 kind='ground' if index==1 else 'wall' if index==2 else 'river-region' if index==3 else 'base-detail'
 minimum=10000 if kind=='ground' else 100 if kind=='river-region' else 16 if kind=='wall' else 48
 polys=contours(labels==index,minimum)
 stats[str(color)]={'polygons':len(polys),'pixels':int(np.sum(labels==index))}
 for p in polys:
  # Ground's external contour is underlaid; other color regions fill its holes.
  epsilon=.7
  while len(p)>200:
   p=simplify(p,epsilon);epsilon*=1.2
  count+=1
  item={'id':f'ref-{kind}-{count}','type':kind,'points':[[round(x*scale,5),round(y*scale,5)] for x,y in p],'width':1,'fill':'#%02x%02x%02x'%color,'label':{'wall':'Traced jungle wall','river-region':'Traced river bank','ground':'Traced traversable ground','base':'Traced base ground','base-detail':'Traced base detail'}[kind]}
  if kind.startswith('base'):
   item['team']='red' if sum(x for x,y in p)>sum(y for x,y in p) else 'blue'
  geometry.append(item)
# Convert the actual green mask to small paint dabs so the eraser can edit it.
mask=labels==4; bushes=[]
for y in range(0,size,2):
 for x in range(0,size,2):
  if mask[y,x]:bushes.append({'id':f'ref-bush-{len(bushes)}','x':round((x+.5)*scale,5),'y':round((y+.5)*scale,5),'r':round(1.45*scale,5)})
reference={'id':'reference-attached-v1','name':'Attached Reference · vector reconstruction','description':'Editable tracing of the supplied square: southwest blue base, northeast red base, split diagonal river, curved black jungle walls and bright green bushes. Original hand-drawn asymmetry is retained.','width':1000,'height':1000,'pointSymmetry':False,'pairing':False,'geometry':geometry,'bushes':bushes,'lanes':[],'rivers':[],'jungles':[],'terrain':[],'objectiveZones':[],
'palette':{'ground':'#000000','wall':'#101813','river':'#139cc5','bush':'#22b14c','baseBlue':'#73979f','baseRed':'#73979f','fountainBlue':'#3f6b8e','fountainRed':'#7e5c68'},
'referenceInfo':{'title':'Supplied reference reconstruction','sourceLibraryFileId':'libfile_0c16c28080ac8191b53f9a491927a99c','sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':list(crop),'note':'Source colors were segmented and their boundaries traced into editable polygons, with subpixel contour simplification. Bush mask is editable paint dabs. No background or generated image is rendered.','asymmetryNote':'Reference contours and initial fountain positions preserve hand-drawn asymmetries; this preset does not claim exact point symmetry. Rotation pairing remains available for new placements and brush strokes.','traceStats':stats},
'entities':[{'kind':'fountain','team':'blue','x':round((42-13)*scale,5),'y':round((662-15)*scale,5),'angle':0,'radius':49,'healingZone':True},{'kind':'fountain','team':'red','x':round((663-13)*scale,5),'y':round((39-15)*scale,5),'angle':180,'radius':49,'healingZone':True}]}
output.write_text('/** Programmatic editable trace of supplied reference. Generated by scripts/trace-reference.py. */\nexport const REFERENCE_PRESET='+json.dumps(reference,separators=(',',':'))+';\n')
output.with_name('reference-trace-stats.json').write_text(json.dumps({'features':len(geometry),'bushStamps':len(bushes),'maxPoints':max(len(g['points']) for g in geometry),'stats':stats},indent=2))
print('Traced',len(geometry),'editable polygons,',len(bushes),'editable bush dabs; max points',max(len(g['points']) for g in geometry))
