"""Prepare Rodin mesh, gorilla deform rig, optional IK controls and motion studies.
Run in Blender background mode. Preserves the original downloaded geometry.
"""
import bpy,bmesh,math,json
import numpy as np
from pathlib import Path
from mathutils import Vector,Quaternion
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'gorilla_rodin_geometry.blend'))
s=bpy.context.scene
body=bpy.data.objects['model'];body.name='Gorilla_Rodin_Body'
bm=bmesh.new();bm.from_mesh(body.data)
before=len(bm.verts)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00002)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(body.data);bm.free();body.data.update()
for p in body.data.polygons:p.use_smooth=True
char=bpy.data.collections.new('GORILLA • Rodin character');s.collection.children.link(char)
for col in list(body.users_collection):col.objects.unlink(body)
char.objects.link(body)
arm=bpy.data.armatures.new('Gorilla_Rodin_Skeleton');rig=bpy.data.objects.new('Gorilla_Rodin_Rig',arm);char.objects.link(rig)
rig.show_in_front=True;arm.display_type='OCTAHEDRAL'
def active(o):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
active(rig);bpy.ops.object.mode_set(mode='EDIT')
B={
 'root':((0,0,0),(0,0,.18),None),
 'pelvis':((0,.15,.88),(0,.14,1.09),'root'),
 'spine_01':((0,.14,1.09),(0,.14,1.29),'pelvis'),
 'spine_02':((0,.14,1.29),(0,.14,1.49),'spine_01'),
 'spine_03':((0,.14,1.49),(0,.13,1.72),'spine_02'),
 'neck_01':((0,.13,1.72),(0,-.04,1.87),'spine_03'),
 'head':((0,-.04,1.87),(0,-.015,2.14),'neck_01'),
 'cloth_front':((0,-.205,.98),(0,-.205,.62),'pelvis'),
 'cloth_tip':((0,-.205,.62),(0,-.205,.32),'cloth_front'),
 'cloth_back':((0,.54,.93),(0,.555,.45),'pelvis')}
for sign,side in [(-1,'l'),(1,'r')]:
 B.update({
 'clavicle_'+side:((sign*.12,.09,1.64),(sign*.47,.07,1.64),'spine_03'),
 'upperarm_'+side:((sign*.47,.07,1.64),(sign*.79,-.03,1.07),'clavicle_'+side),
 'lowerarm_'+side:((sign*.79,-.03,1.07),(sign*.96,-.18,.54),'upperarm_'+side),
 'hand_'+side:((sign*.96,-.18,.54),(sign*.99,-.30,.30),'lowerarm_'+side),
 'thigh_'+side:((sign*.27,.22,.88),(sign*.32,.19,.48),'pelvis'),
 'calf_'+side:((sign*.32,.19,.48),(sign*.33,.12,.15),'thigh_'+side),
 'foot_'+side:((sign*.33,.12,.15),(sign*.33,-.12,.10),'calf_'+side),
 'ball_'+side:((sign*.33,-.12,.10),(sign*.33,-.205,.09),'foot_'+side)})
for name,(head,tail,parent) in B.items():
 b=arm.edit_bones.new(name);b.head=head;b.tail=tail;b.use_deform=name!='root'
 if parent:b.parent=arm.edit_bones[parent]
# Controls live separately from export skeleton; IK starts off for FK clips.
for sign,side in [(-1,'l'),(1,'r')]:
 for name,pos in [('CTRL_hand_'+side,(sign*.96,-.18,.54)),('CTRL_foot_'+side,(sign*.33,.12,.15)),('CTRL_elbow_'+side,(sign*1.2,.8,1.1)),('CTRL_knee_'+side,(sign*.33,-.65,.48))]:
  b=arm.edit_bones.new(name);b.head=pos;b.tail=Vector(pos)+Vector((0,0,.12));b.use_deform=False;b.parent=arm.edit_bones['root']
bpy.ops.object.mode_set(mode='OBJECT')
for pb in rig.pose.bones:pb.rotation_mode='QUATERNION'
for side in ['l','r']:
 for end,goal,pole in [('lowerarm_','CTRL_hand_','CTRL_elbow_'),('calf_','CTRL_foot_','CTRL_knee_')]:
  c=rig.pose.bones[end+side].constraints.new('IK');c.name='Optional IK • enable for posing';c.target=rig;c.subtarget=goal+side;c.pole_target=rig;c.pole_subtarget=pole+side;c.chain_count=2;c.influence=0
  c.pole_angle=0
rig['IK_notes']='IK is disabled during FK motion studies. Enable per limb and adjust pole angle when editing.'
# Anatomically constrained skinning prevents long hands from attracting leg weights.
def distance(p,a,b):
 a,b=Vector(a),Vector(b);d=b-a
 return (p-a-d*max(0,min(1,(p-a).dot(d)/d.length_squared))).length
G={n:body.vertex_groups.new(name=n) for n in B if n!='root'}
for v in body.data.vertices:
 p=v.co;x,y,z=p;ax=abs(x);side='r' if x>0 else 'l'
 if ax<.22 and y<-.15 and .29<z<.94:
  ns=['cloth_front','cloth_tip','pelvis']
 elif ax<.24 and y>.49 and .4<z<.94:
  ns=['cloth_back','pelvis']
 elif ax>.64:
  ns=[n+'_'+side for n in ['clavicle','upperarm','lowerarm','hand']]
  # Bracers and hands remain solid; avoid soft rubber around metal.
  if ax>.68 and .50<z<.77:ns=['lowerarm_'+side]
  if z<.48 and ax>.63:ns=['hand_'+side]
  if x<-.46 and z>1.57:ns=['upperarm_l']
 elif z<.89:
  ns=[n+'_'+side for n in ['thigh','calf','foot','ball']]+['pelvis']
 elif z>1.75 and ax<.39:
  ns=['head','neck_01']
 else:ns=['pelvis','spine_01','spine_02','spine_03','neck_01']+([n+'_'+side for n in ['clavicle','upperarm','lowerarm']] if ax>.35 and z>1.42 else [])
 scores=sorted([(distance(p,*B[n][:2]),n) for n in ns])[:3]
 weights=[1/(d+.045)**6 for d,n in scores];total=sum(weights)
 for (d,n),w in zip(scores,weights):
  if w/total>.002:G[n].add([v.index],w/total,'REPLACE')
# Smooth weights along actual mesh adjacency to remove hard anatomical boundaries.
names=list(G);w=np.zeros((len(body.data.vertices),len(names)),dtype=float)
for v in body.data.vertices:
 for g in v.groups:w[v.index,g.group]=g.weight
edge=np.array([tuple(e.vertices) for e in body.data.edges]);a=np.concatenate((edge[:,0],edge[:,1]));b=np.concatenate((edge[:,1],edge[:,0]));degree=np.bincount(a,minlength=len(w))
for iteration in range(35):
 summed=np.zeros_like(w);np.add.at(summed,a,w[b]);averaged=summed/np.maximum(degree[:,None],1)
 w=.55*w+.45*averaged
# Retain a maximum of four normalized influences for game export.
for v in body.data.vertices:
 row=w[v.index];top=np.argsort(row)[-4:];total=row[top].sum()
 for group in body.vertex_groups:group.remove([v.index])
 for i in top:
  if row[i]>0:G[names[i]].add([v.index],float(row[i]/total),'REPLACE')
mod=body.modifiers.new('Gorilla skin deformation','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=True;body.parent=rig
# Control shapes and bone collections.
deform=arm.collections.new('Deform • export');controls=arm.collections.new('Controls • optional IK')
for b in arm.bones:
 (controls if b.name.startswith('CTRL_') else deform).assign(b)
 b.color.palette='THEME04' if b.name.startswith('CTRL_') else 'THEME03'
# Stable local rotation from world-axis rotations; rest pose axes differ per limb.
def rotate(name,axis,angle):
 pb=rig.pose.bones[name];local=pb.bone.matrix_local.to_3x3().inverted()@Vector(axis)
 pb.rotation_quaternion=Quaternion(local,angle)
def shift(name,delta):
 pb=rig.pose.bones[name];pb.location=pb.bone.matrix_local.to_3x3().inverted()@Vector(delta)
def reset():
 for p in rig.pose.bones:p.rotation_quaternion=Quaternion();p.location=(0,0,0);p.scale=(1,1,1)
def idle(t):
 wave=math.sin(t*math.tau)
 rotate('spine_03',(1,0,0),.018*wave);rotate('head',(0,0,1),.028*wave)
 for sign,side in [(-1,'l'),(1,'r')]:rotate('upperarm_'+side,(0,1,0),sign*.015*wave)
 rotate('cloth_front',(1,0,0),.025*wave)
def walk(t):
 a=math.sin(t*math.tau);b=math.cos(t*math.tau)
 shift('pelvis',(0,0,.018*(1-b*b)));rotate('spine_03',(0,0,1),.06*a);rotate('head',(0,0,1),-.045*a)
 for sign,side in [(-1,'l'),(1,'r')]:
  v=sign*a
  rotate('upperarm_'+side,(1,0,0),.20*v);rotate('lowerarm_'+side,(1,0,0),-.14*max(0,-v))
  rotate('thigh_'+side,(1,0,0),-.26*v);rotate('calf_'+side,(1,0,0),.33*max(0,v));rotate('foot_'+side,(1,0,0),-.14*max(0,v))
 rotate('cloth_front',(1,0,0),.10*a);rotate('cloth_tip',(1,0,0),.07*math.sin(t*math.tau-.5));rotate('cloth_back',(1,0,0),-.08*a)
def pulse(t,start,peak,end):
 if t<=start or t>=end:return 0
 u=(t-start)/(peak-start) if t<peak else (end-t)/(end-peak)
 return u*u*(3-2*u)
def punch(t):
 wind=pulse(t,0,.25,.42);hit=pulse(t,.25,.43,1)
 rotate('spine_03',(0,0,1),.19*wind-.30*hit)
 rotate('upperarm_r',(1,0,0),-.42*wind+1.2*hit)
 rotate('lowerarm_r',(1,0,0),.6*wind+.22*hit)
 rotate('head',(0,0,1),-.10*wind+.13*hit)
 shift('pelvis',(0,-.04*hit,-.025*hit));rotate('cloth_front',(1,0,0),-.12*hit)
def slam(t):
 wind=pulse(t,0,.28,.51);hit=pulse(t,.3,.5,1)
 for sign,side in [(-1,'l'),(1,'r')]:
  rotate('upperarm_'+side,(1,0,0),1.25*wind+.30*hit);rotate('lowerarm_'+side,(1,0,0),.55*wind)
 rotate('spine_02',(1,0,0),-.12*wind+.24*hit);shift('pelvis',(0,-.03*hit,-.025*hit));rotate('head',(1,0,0),-.12*wind+.10*hit)
def roar(t):
 v=math.sin(math.pi*t)**2
 rotate('spine_03',(1,0,0),-.1*v);rotate('head',(1,0,0),-.18*v)
 for sign,side in [(-1,'l'),(1,'r')]:
  rotate('upperarm_'+side,(0,1,0),-sign*.75*v);rotate('lowerarm_'+side,(1,0,0),.8*v)
def flinch(t):
 v=pulse(t,0,.2,1);rotate('spine_03',(1,0,0),-.16*v);rotate('head',(1,0,0),-.2*v)
def action(name,length,func,loop=False):
 rig.animation_data_create();rig.animation_data.action=None
 a=bpy.data.actions.new(name);a.use_fake_user=True;rig.animation_data.action=a
 for f in range(1,length+1):
  s.frame_set(f);reset();func((f-1)/(length-1))
  bpy.context.view_layer.update()
  ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());posed=ev.to_mesh()
  low=min(posed.vertices[v.index].co.z for v in body.data.vertices if abs(v.co.x)<.6 and v.co.z<.2)
  ev.to_mesh_clear()
  shift('root',(0,0,max(0,-low)))
  for p in rig.pose.bones:
   if p.name.startswith('CTRL_'):continue
   p.keyframe_insert('rotation_quaternion',frame=f);p.keyframe_insert('location',frame=f);p.keyframe_insert('scale',frame=f)
 a['loop']=loop;a['status']='Editable first-pass FK animation study'
 return a
s.render.fps=24
A=[action('Rodin_Idle',49,idle,True),action('Rodin_Walk',33,walk,True),action('Rodin_HeavyPunch',25,punch),action('Rodin_GroundSlam',37,slam),action('Rodin_Challenge',49,roar),action('Rodin_HitReact',19,flinch)]
# Check normalization and finite geometry across every clip; detect extreme edge stretching.
weight_errors=sum(abs(sum(g.weight for g in v.groups)-1)>.001 for v in body.data.vertices)
rest=[v.co.copy() for v in body.data.vertices];edges=[tuple(e.vertices) for e in body.data.edges]
base=[(rest[a]-rest[b]).length for a,b in edges]
validation={'vertices_before_weld':before,'vertices':len(rest),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'deform_bones':sum(b.use_deform for b in arm.bones),'control_bones':8,'weight_errors':weight_errors,'actions':{}}
for a in A:
 rig.animation_data.action=a;bad=0;stretch=[];below=[]
 for frame in range(1,int(a.frame_range[1])+1):
  s.frame_set(frame);ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();coords=[v.co.copy() for v in mesh.vertices]
  bad+=sum(not all(math.isfinite(c) for c in v) for v in coords)
  stretch.append(max((coords[i]-coords[j]).length/d for (i,j),d in zip(edges,base) if d>.005))
  below.append(min(v.z for v in coords));ev.to_mesh_clear()
 validation['actions'][a.name]={'frames':int(a.frame_range[1]),'nonfinite_vertices':bad,'max_edge_stretch_ratio':round(max(stretch),3),'lowest_point_m':round(min(below),3)}
assert weight_errors==0
assert all(v['nonfinite_vertices']==0 for v in validation['actions'].values())
# Render studio and saved cameras.
studio=bpy.data.collections.new('STUDIO • not exported');s.collection.children.link(studio)
def put(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 studio.objects.link(o)
def camera(name,loc,target,scale):
 d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=scale;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
hero=camera('Camera_Hero',(3.5,-6,3.0),(0,0,1.2),3.65)
front=camera('Camera_Front',(0,-6,1.1),(0,0,1.1),2.8)
rear=camera('Camera_Rear',(-3,5,2.8),(0,0,1.2),3.65)
game=camera('Camera_Gameplay',(3,-4,6),(0,0,1),3.1)
for name,loc,power,size in [('Key',(3,-4,5),550,4),('Fill',(-3,-2,3),250,3),('Rim',(1,3,4),700,3)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.025));floor=bpy.context.object;floor.name='Studio floor';put(floor)
mat=bpy.data.materials.new('Studio charcoal');mat.diffuse_color=(.055,.065,.075,1);floor.data.materials.append(mat)
s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True;s.render.resolution_x=800;s.render.resolution_y=800;s.render.resolution_percentage=100;s.world.color=(.10,.10,.10)
s.view_settings.view_transform='AgX'
# Save with a clear model view and idle clip selected.
rig.animation_data.action=A[0];s.frame_set(1);s.frame_end=49;s.camera=hero
active(body)
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_distance=4.5;area.spaces.active.region_3d.view_location=(0,0,1.1)
   area.spaces.active.region_3d.view_rotation=hero.rotation_euler.to_quaternion()
   area.spaces.active.shading.type='MATERIAL';area.spaces.active.overlay.show_floor=False
rig['retarget_root']='pelvis';rig['Unreal_notes']='Custom gorilla proportions. Map named limb/spine chains in Unreal IK Rig; match retarget poses. Not an exact Manny skeleton.'
s['asset_status']='Rodin geometry with cleaned UV seams, prototype skinning and six motion studies. Textures pending.'
(R/'rodin_rig_validation.json').write_text(json.dumps(validation,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(R/'gorilla_rodin_rigged.blend'))
active(rig);body.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(R/'gorilla_rodin_rigged.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS')
bpy.ops.export_scene.fbx(filepath=str(R/'gorilla_rodin_rigged.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,use_armature_deform_only=True,bake_anim=True,bake_anim_use_all_actions=True,axis_forward='-Y',axis_up='Z')
for name,cam,act,frame in [('hero',hero,A[0],1),('rear',rear,A[0],1),('gameplay',game,A[0],1),('punch',hero,A[2],11),('slam',hero,A[3],19),('challenge',hero,A[4],25)]:
 s.camera=cam;rig.animation_data.action=act;s.frame_set(frame);s.render.filepath=str(R/'renders'/('rodin_rig_'+name+'.png'));bpy.ops.render.render(write_still=True)
print('RODIN_RIG_DONE',json.dumps(validation))
