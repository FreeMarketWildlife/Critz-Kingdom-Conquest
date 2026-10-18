"""Build Theo's custom rig, six editable motion studies and portable exports.
Preserves Meshy downloads. Run with Blender --background --python this_file.
"""
import bpy, math, json
import numpy as np
from pathlib import Path
from mathutils import Vector, Quaternion, Matrix

R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'theo_prepared_v01.blend'))
s=bpy.context.scene;body=bpy.data.objects['Theo_Body']
for v in body.data.vertices:v.co.y+=.20
body.data.update()
char=bpy.data.collections.new('THEO • character and rig');s.collection.children.link(char)
for c in list(body.users_collection):c.objects.unlink(body)
char.objects.link(body)
arm=bpy.data.armatures.new('Theo_Skeleton');rig=bpy.data.objects.new('Theo_Rig',arm);char.objects.link(rig)
rig.show_in_front=True;arm.display_type='OCTAHEDRAL'
def active(o):
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
active(rig);bpy.ops.object.mode_set(mode='EDIT')
B={
 'root':((0,0,0),(0,0,.08),None),
 'pelvis':((0,.01,.34),(0,0,.46),'root'),
 'spine_01':((0,0,.46),(0,-.015,.57),'pelvis'),
 'spine_02':((0,-.015,.57),(0,-.03,.68),'spine_01'),
 'neck_01':((0,-.03,.68),(0,-.05,.79),'spine_02'),
 'head':((0,-.05,.79),(0,-.07,1.04),'neck_01'),
 'mullet_01':((0,.12,.83),(0,.15,.63),'head'),
 'mullet_02':((0,.15,.63),(0,.15,.45),'mullet_01'),
}
tail=[(0,.12,.26),(0,.22,.18),(0,.32,.115),(0,.43,.075),(0,.54,.06),(0,.65,.055),(0,.75,.055)]
for i in range(6):B[f'tail_{i+1:02}']=(tail[i],tail[i+1],'pelvis' if i==0 else f'tail_{i:02}')
for sign,side in [(-1,'l'),(1,'r')]:
    B.update({
     'clavicle_'+side:((sign*.045,-.025,.69),(sign*.16,-.055,.68),'spine_02'),
     'upperarm_'+side:((sign*.16,-.055,.68),(sign*.29,-.10,.54),'clavicle_'+side),
     'lowerarm_'+side:((sign*.29,-.10,.54),(sign*.385,-.145,.43),'upperarm_'+side),
     'hand_'+side:((sign*.385,-.145,.43),(sign*.397,-.17,.37),'lowerarm_'+side),
     'thigh_'+side:((sign*.11,.015,.34),(sign*.155,-.065,.205),'pelvis'),
     'calf_'+side:((sign*.155,-.065,.205),(sign*.165,-.065,.065),'thigh_'+side),
     'foot_'+side:((sign*.165,-.065,.065),(sign*.19,-.165,.034),'calf_'+side),
     'ball_'+side:((sign*.19,-.165,.034),(sign*.235,-.20,.026),'foot_'+side),
     'socket_weapon_'+side:((sign*.395,-.175,.40),(sign*.395,-.25,.40),'hand_'+side),
    })
    for i,x in enumerate([.365,.39,.414]):
        B[f'digit_{i+1:02}_{side}']=((sign*x,-.17,.389),(sign*(x+.004),-.19,.335),'hand_'+side)
    B['thumb_'+side]=((sign*.355,-.17,.445),(sign*.35,-.205,.402),'hand_'+side)
for name,(h,t,p) in B.items():
    b=arm.edit_bones.new(name);b.head=h;b.tail=t;b.use_deform=name!='root'
    if p:b.parent=arm.edit_bones[p]
for sign,side in [(-1,'l'),(1,'r')]:
    for name,pos in [('CTRL_hand_'+side,B['hand_'+side][0]),('CTRL_foot_'+side,B['foot_'+side][0]),('CTRL_elbow_'+side,(sign*.45,-.5,.55)),('CTRL_knee_'+side,(sign*.16,-.6,.20))]:
        b=arm.edit_bones.new(name);b.head=pos;b.tail=Vector(pos)+Vector((0,0,.055));b.use_deform=False;b.parent=arm.edit_bones['root']
bpy.ops.object.mode_set(mode='OBJECT')
deform=arm.collections.new('Deform bones');controls=arm.collections.new('Optional IK and weapon sockets')
for b in arm.bones:
    (deform if b.use_deform else controls).assign(b)
    b.color.palette='THEME03' if b.use_deform else 'THEME04'
for p in rig.pose.bones:p.rotation_mode='QUATERNION'
for side in ['l','r']:
    for end,goal,pole in [('lowerarm_','CTRL_hand_','CTRL_elbow_'),('calf_','CTRL_foot_','CTRL_knee_')]:
        c=rig.pose.bones[end+side].constraints.new('IK');c.name='Optional editor IK (disabled for baked clips)';c.target=rig;c.subtarget=goal+side;c.pole_target=rig;c.pole_subtarget=pole+side;c.chain_count=2;c.influence=0

# Anatomical skinning with adjacency smoothing and four normalized influences.
names=[n for n in B if arm.bones[n].use_deform and not n.startswith('socket_')];groups={n:body.vertex_groups.new(name=n) for n in names}
def distance(p,a,b):
    a,b=Vector(a),Vector(b);d=b-a
    return (p-a-d*max(0,min(1,(p-a).dot(d)/d.length_squared))).length
W=np.zeros((len(body.data.vertices),len(names)));forced={}
# Identify denim from its diffuse texture so clothing never follows nearby arms.
base_image=body.data.materials[0].node_tree.nodes.get('Image Texture').image
pixels=np.empty(len(base_image.pixels),dtype=np.float32);base_image.pixels.foreach_get(pixels)
pixels=pixels.reshape((base_image.size[1],base_image.size[0],4))
colors=np.zeros((len(W),3));color_counts=np.zeros(len(W))
uv=body.data.uv_layers.active.data
for loop in body.data.loops:
    u,v=uv[loop.index].uv;px=min(base_image.size[0]-1,max(0,int(u*base_image.size[0])));py=min(base_image.size[1]-1,max(0,int(v*base_image.size[1])))
    colors[loop.vertex_index]+=pixels[py,px,:3];color_counts[loop.vertex_index]+=1
colors/=np.maximum(color_counts[:,None],1)
denim=(colors[:,2]>colors[:,0]*1.06)&(colors[:,2]>colors[:,1]*1.015)
for v in body.data.vertices:
    p=v.co;x,y,z=p;ax=abs(x);side='r' if x>0 else 'l'
    if y>.08 and z<.28 and ax<.105:
        ns=[f'tail_{i:02}' for i in range(1,7)]+(['pelvis'] if y<.16 else [])
    elif z>.80 or (z>.73 and y<-.13 and ax<.22):
        ns=['head','neck_01'] if z<.86 else ['head']
        if z>.96 or y<-.26:forced[v.index]='head'
    elif y>.09 and .44<z<.86 and ax<.16:
        ns=['mullet_01','mullet_02','neck_01','head']
    elif ax>.12 and z>.30:
        ns=['pelvis','spine_01','spine_02','neck_01']+[n+'_'+side for n in ['clavicle','upperarm','lowerarm','hand']]
        if ax>.34 and z<.455:
            ns=['hand_'+side,'thumb_'+side]+[f'digit_{i:02}_{side}' for i in range(1,4)]
    elif z<.34:
        ns=[n+'_'+side for n in ['thigh','calf','foot','ball']]+(['pelvis'] if z>.24 else [])
        if z<.08 and y<-.04:ns=['foot_'+side,'ball_'+side]
    else:
        ns=['pelvis','spine_01','spine_02','neck_01']
        if ax>.14 and z>.55:ns += [n+'_'+side for n in ['clavicle','upperarm']]
    scores=sorted([(distance(p,*B[n][:2]),n) for n in ns])[:3]
    values=np.array([1/(d+.025)**5 for d,n in scores]);values/=values.sum()
    for (_,n),value in zip(scores,values):W[v.index,names.index(n)]=value
edges=np.array([e.vertices[:] for e in body.data.edges],dtype=int)
a=np.concatenate((edges[:,0],edges[:,1]));b=np.concatenate((edges[:,1],edges[:,0]));degree=np.bincount(a,minlength=len(W))
for it in range(18):
    sums=np.zeros_like(W);np.add.at(sums,a,W[b]);W=.5*W+.5*sums/np.maximum(degree[:,None],1)
for idx,name in forced.items():W[idx]=0;W[idx,names.index(name)]=1
for v in body.data.vertices:
    if v.co.z<.70 and ((denim[v.index] and abs(v.co.x)<.24) or (abs(v.co.x)<.21 and .32<v.co.z<.54)):
        ns=['pelvis','spine_01','spine_02','neck_01']
        if v.co.z<.38:ns += [n+('_r' if v.co.x>0 else '_l') for n in ['thigh','calf','foot','ball']]
        scores=sorted([(distance(v.co,*B[n][:2]),n) for n in ns])[:3]
        values=np.array([1/(d+.025)**5 for d,n in scores]);values/=values.sum();W[v.index]=0
        for (_,name),value in zip(scores,values):W[v.index,names.index(name)]=value
    if v.co.y>.12 and v.co.z<.24 and abs(v.co.x)<.075:
        for j,name in enumerate(names):
            if not name.startswith('tail_'):W[v.index,j]=0
        if W[v.index].sum()>0:W[v.index]/=W[v.index].sum()
for v in body.data.vertices:
    row=W[v.index];top=np.argsort(row)[-4:];total=row[top].sum()
    for j in top:
        if row[j]>1e-8:groups[names[j]].add([v.index],float(row[j]/total),'REPLACE')
mod=body.modifiers.new('Theo skin','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=False;body.parent=rig
for p in body.data.polygons:p.use_smooth=True

# Restore the approved cigarette as a separate rigid accessory at the lip.
def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m
paper=material('Cigarette paper',(.72,.72,.64));filtermat=material('Cigarette filter',(.36,.17,.07));ash=material('Cigarette ash',(.09,.07,.055))
start=Vector((.045,-.318,.79));end=start+Vector((.055,-.105,-.035))
parts=[]
for name,u,v,mat in [('Filter',0,.24,filtermat),('Paper',.24,.93,paper),('Ash',.93,1,ash)]:
    aa=start+(end-start)*u;bb=start+(end-start)*v
    bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=.006,depth=(bb-aa).length,location=(aa+bb)/2)
    obj=bpy.context.object;obj.name='Theo_Cigarette_'+name;obj.rotation_euler=(bb-aa).to_track_quat('Z','Y').to_euler();obj.data.materials.append(mat);parts.append(obj)
active(parts[0])
for o in parts:o.select_set(True)
bpy.ops.object.join();cig=bpy.context.object;cig.name='Theo_Cigarette'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
for c in list(cig.users_collection):c.objects.unlink(cig)
char.objects.link(cig)
g=cig.vertex_groups.new(name='head');g.add(list(range(len(cig.data.vertices))),1,'REPLACE');m=cig.modifiers.new('Follow mouth','ARMATURE');m.object=rig;cig.parent=rig

# World-axis FK helpers and analytically planted legs. No live constraints in exports.
def rotate(name,axis,angle):
    pb=rig.pose.bones[name];local=pb.bone.matrix_local.to_3x3().inverted()@Vector(axis)
    pb.rotation_quaternion=pb.rotation_quaternion@Quaternion(local,angle)
def shift(name,delta):
    p=rig.pose.bones[name];p.location=p.bone.matrix_local.to_3x3().inverted()@Vector(delta)
def reset():
    for p in rig.pose.bones:p.rotation_quaternion=Quaternion();p.location=(0,0,0);p.scale=(1,1,1)
def point_bone(name,head,tail):
    pb=rig.pose.bones[name];rest=pb.bone.tail_local-pb.bone.head_local
    q=rest.rotation_difference(tail-head)
    matrix=q.to_matrix().to_4x4()@pb.bone.matrix_local.to_3x3().to_4x4();matrix.translation=head
    pb.matrix=matrix;bpy.context.view_layer.update()
def legs(targets):
    bpy.context.view_layer.update()
    for side,target in targets.items():
        th=rig.pose.bones['thigh_'+side];H=th.head.copy();A=Vector(target)
        l1=arm.bones['thigh_'+side].length;l2=arm.bones['calf_'+side].length
        delta=A-H;d=min(delta.length,l1+l2-.0001);direction=delta.normalized()
        pole=Vector((0,-1,0));perp=(pole-direction*pole.dot(direction)).normalized()
        run=(l1*l1-l2*l2+d*d)/(2*d);height=math.sqrt(max(0,l1*l1-run*run));K=H+direction*run+perp*height
        point_bone('thigh_'+side,H,K);point_bone('calf_'+side,K,A)
        ft=rig.pose.bones['foot_'+side];mat=ft.bone.matrix_local.copy();mat.translation=A;ft.matrix=mat;bpy.context.view_layer.update()
        rig.pose.bones['ball_'+side].rotation_quaternion=Quaternion()
def pulse(t,start,peak,end):
    if t<=start or t>=end:return 0
    u=(t-start)/(peak-start) if t<peak else (end-t)/(end-peak)
    return u*u*(3-2*u)
hand_targets={};hand_directions={}
def arms():
    bpy.context.view_layer.update()
    for side,target in hand_targets.items():
        pb=rig.pose.bones['upperarm_'+side];H=pb.head.copy();A=Vector(target)
        l1=arm.bones['upperarm_'+side].length;l2=arm.bones['lowerarm_'+side].length
        delta=A-H;direction=delta.normalized();d=min(delta.length,l1+l2-.001)
        A=H+direction*d
        pole=Vector((1 if side=='r' else -1,.35,0));perp=(pole-direction*pole.dot(direction)).normalized()
        run=(l1*l1-l2*l2+d*d)/(2*d);height=math.sqrt(max(0,l1*l1-run*run));K=H+direction*run+perp*height
        point_bone('upperarm_'+side,H,K);point_bone('lowerarm_'+side,K,A)
        direction=Vector(hand_directions.get(side,(0,-.2,-1))).normalized()
        point_bone('hand_'+side,A,A+direction*arm.bones['hand_'+side].length)
def tail_pose(t):
    bpy.context.view_layer.update()
    base=(rig.pose.bones['pelvis'].matrix@arm.bones['pelvis'].matrix_local.inverted())@Vector(tail[0])
    delta=base-Vector(tail[0]);points=[]
    for i,p in enumerate(tail):
        q=Vector(p)+delta*(1-i/6)**2
        q.x+=.022*math.sin(t*math.tau-i*.5)*(i/6)
        q.z=max(.047,q.z);points.append(q)
    for i in range(6):point_bone(f'tail_{i+1:02}',points[i],points[i+1])
    # Keep the thick underside of the tail clear without lifting planted feet.
    bpy.context.view_layer.update();ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh()
    lowest=min(mesh.vertices[v.index].co.z for v in body.data.vertices if v.co.y>.12 and v.co.z<.24 and abs(v.co.x)<.075);ev.to_mesh_clear()
    if lowest<.001:
        matrices={f'tail_{i:02}':rig.pose.bones[f'tail_{i:02}'].matrix.copy() for i in range(1,7)}
        for name,matrix in matrices.items():
            matrix.translation.z+=.001-lowest;rig.pose.bones[name].matrix=matrix;bpy.context.view_layer.update()
def fist(side,strength):
    for i in range(1,4):rotate(f'digit_{i:02}_{side}',(1,0,0),strength*.9)
    rotate('thumb_'+side,(0,0,1),(.3 if side=='r' else -.3)*strength)
def stance(t):
    hand_targets.clear();hand_directions.clear()
    for sign,side in [(-1,'l'),(1,'r')]:
        hand_targets[side]=Vector((sign*.245,-.14,.40))
        rotate('upperarm_'+side,(0,1,0),sign*.38)
        rotate('lowerarm_'+side,(1,0,0),-.35)
    for i in range(1,7):
        rotate(f'tail_{i:02}',(0,0,1),.025*math.sin(t*math.tau-i*.4))
    rotate('mullet_02',(1,0,0),.018*math.sin(t*math.tau-.5))
def idle(t):
    w=math.sin(t*math.tau);stance(t);shift('pelvis',(0,0,.003*w));rotate('spine_02',(1,0,0),.015*w);rotate('head',(0,0,1),.035*w)
    return {side:Vector(B['foot_'+side][0]) for side in ['l','r']}
def walk(t):
    stance(t);phase=t*math.tau;wave=math.sin(phase);shift('pelvis',(0,0,-.012+.006*math.cos(2*phase)))
    rotate('spine_02',(0,0,1),.05*wave);rotate('head',(0,0,1),-.035*wave)
    targets={}
    for sign,side in [(-1,'l'),(1,'r')]:
        p=(t+(0 if side=='l' else .5))%1
        if p<.60:progress=p/.60;y=-.035+.070*progress;lift=0
        else:progress=(p-.60)/.40;y=.035-.070*progress;lift=.045*math.sin(math.pi*progress)
        targets[side]=Vector(B['foot_'+side][0])+Vector((0,y,lift))
        hand_targets[side].y+=sign*.035*wave
    return targets
def punch(t):
    stance(0);wind=pulse(t,0,.24,.44);hit=pulse(t,.24,.46,1)
    rotate('spine_02',(0,0,1),-.18*wind+.24*hit);rotate('head',(0,0,1),.09*wind-.10*hit)
    rotate('upperarm_r',(1,0,0),.30*wind-1.05*hit);rotate('upperarm_r',(0,0,1),-.20*hit)
    rotate('lowerarm_r',(1,0,0),-.80*wind+.27*hit);fist('r',max(wind,hit));fist('l',.5*max(wind,hit))
    hand_targets['r']=Vector((.245,-.14,.40))*(1-wind-hit)+Vector((.25,-.03,.63))*wind+Vector((.13,-.39,.65))*hit
    hand_directions['r']=(0,-1,-.15)
    shift('pelvis',(0,-.025*hit,-.022*hit));return {side:Vector(B['foot_'+side][0]) for side in ['l','r']}
def slam(t):
    stance(0);wind=pulse(t,0,.30,.49);hit=pulse(t,.30,.53,1)
    shift('pelvis',(0,-.025*hit,-.14*hit));rotate('spine_01',(1,0,0),-.08*wind+.65*hit);rotate('spine_02',(1,0,0),-.04*wind+.55*hit)
    for sign,side in [(-1,'l'),(1,'r')]:
        rotate('upperarm_'+side,(1,0,0),-1.9*wind-.3*hit);rotate('lowerarm_'+side,(1,0,0),-.65*wind+.16*hit);fist(side,max(wind,hit))
        hand_targets[side]=Vector((sign*.245,-.14,.40))*(1-wind-hit)+Vector((sign*.20,-.15,.98))*wind+Vector((sign*.19,-.46,.11))*hit
        hand_directions[side]=(0,-.15,-1)
    rotate('head',(1,0,0),-.05*wind-.55*hit)
    return {side:Vector(B['foot_'+side][0]) for side in ['l','r']}
def challenge(t):
    stance(0);v=math.sin(math.pi*t)**2;beat=math.sin(t*math.tau*3)*v
    rotate('spine_02',(1,0,0),-.05*v);rotate('head',(0,0,1),.15*beat);rotate('head',(1,0,0),-.05*v)
    for sign,side in [(-1,'l'),(1,'r')]:
        rotate('upperarm_'+side,(0,1,0),-sign*.7*v);rotate('lowerarm_'+side,(1,0,0),-.8*v)
        rotate('hand_'+side,(0,0,1),sign*.15*beat)
        hand_targets[side]=Vector((sign*.245,-.14,.40))*(1-v)+Vector((sign*.33,-.16,.65))*v
    for i in range(1,7):rotate(f'tail_{i:02}',(0,0,1),.055*v*math.sin(t*math.tau-i*.45))
    return {side:Vector(B['foot_'+side][0]) for side in ['l','r']}
def flinch(t):
    stance(0);v=pulse(t,0,.22,1);shift('pelvis',(0,.025*v,-.024*v));rotate('spine_02',(1,0,0),-.17*v);rotate('head',(1,0,0),-.14*v)
    for sign,side in [(-1,'l'),(1,'r')]:rotate('upperarm_'+side,(1,0,0),.16*v)
    return {side:Vector(B['foot_'+side][0]) for side in ['l','r']}

clip_specs=[('Theo_Idle',49,idle,True),('Theo_Walk',33,walk,True),('Theo_HeavyPunch',25,punch,False),('Theo_GroundSlam',37,slam,False),('Theo_Challenge',49,challenge,False),('Theo_HitReact',19,flinch,False)]
s.render.fps=24;rig.animation_data_create();actions=[]
for name,length,func,loop in clip_specs:
    action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
    for frame in range(1,length+1):
        s.frame_set(frame);reset();t=(frame-1)/(length-1);targets=func(t);legs(targets);arms();tail_pose(t)
        bpy.context.view_layer.update();ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());posed=ev.to_mesh()
        low=min(posed.vertices[v.index].co.z for v in body.data.vertices if v.co.z<.08 and abs(v.co.x)>.11);ev.to_mesh_clear()
        if low<-.001:shift('root',(0,0,-low+.001));bpy.context.view_layer.update()
        for pb in rig.pose.bones:
            if pb.name.startswith('CTRL_'):continue
            pb.keyframe_insert('rotation_quaternion',frame=frame);pb.keyframe_insert('location',frame=frame);pb.keyframe_insert('scale',frame=frame)
    action['loop']=loop;action['status']='Custom Theo first-pass motion study, matching gorilla clip timing';actions.append(action)

# Full-frame geometry checks, influence checks and clip endpoint checks.
errors=sum(abs(sum(g.weight for g in v.groups)-1)>.0001 for v in body.data.vertices)
rest=np.array([v.co[:] for v in body.data.vertices]);base=np.linalg.norm(rest[edges[:,0]]-rest[edges[:,1]],axis=1);valid=base>.002
report={'vertices':len(rest),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'deform_bones':sum(b.use_deform for b in arm.bones),'control_bones':8,'weapon_sockets':2,'fps':24,'height_m':1.1,'weight_errors':errors,'max_vertex_influences':max(len(v.groups) for v in body.data.vertices),'actions':{}}
for action,(_,length,func,loop) in zip(actions,clip_specs):
    rig.animation_data.action=action;coords_by_frame=[];ratios=[];below=[];bad=0;worst=None
    for frame in range(1,length+1):
        s.frame_set(frame);ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();coords=np.array([(body.matrix_world@v.co)[:] for v in mesh.vertices]);ev.to_mesh_clear()
        bad+=int((~np.isfinite(coords)).sum());coords_by_frame.append(coords);below.append(float(coords[:,2].min()))
        idx=int(np.argmin(coords[:,2]))
        if worst is None or coords[idx,2]<worst['posed'][2]:worst={'frame':frame,'index':idx,'rest':rest[idx].tolist(),'posed':coords[idx].tolist(),'weights':{body.vertex_groups[g.group].name:g.weight for g in body.data.vertices[idx].groups}}
        ratios.append(np.linalg.norm(coords[edges[:,0]]-coords[edges[:,1]],axis=1)[valid]/base[valid])
    rr=np.concatenate(ratios)
    report['actions'][action.name]={'frames':length,'loop':loop,'nonfinite_values':bad,'lowest_point_m':round(min(below),5),'max_edge_stretch':round(float(rr.max()),3),'p99_edge_stretch':round(float(np.quantile(rr,.99)),3),'endpoint_delta_m':round(float(np.linalg.norm(coords_by_frame[-1]-coords_by_frame[0],axis=1).max()),6),'lowest_vertex':worst}
(R/'theo_rig_validation.json').write_text(json.dumps(report,indent=2))
assert errors==0 and report['max_vertex_influences']<=4
assert all(a['nonfinite_values']==0 and a['lowest_point_m']>=-.002 for a in report['actions'].values())
(R/'theo_rig_validation.json').write_text(json.dumps(report,indent=2))

# Inspection studio and animation previews.
studio=bpy.data.collections.new('STUDIO • excluded from exports');s.collection.children.link(studio)
for o in list(s.objects):
    if o.name not in char.objects:
        for c in list(o.users_collection):c.objects.unlink(o)
        studio.objects.link(o)
def camera(name,loc,target,scale):
    d=bpy.data.cameras.new(name);d.type='ORTHO';d.ortho_scale=scale;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
hero=camera('Camera_Hero',(2,-4,1.65),(0,.08,.58),1.72)
rear=camera('Camera_Rear',(-2,4,1.8),(0,.10,.57),1.75)
game=camera('Camera_Gameplay',(2,-3,4),(0,.08,.45),1.75)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.004));floor=bpy.context.object;floor.name='Studio floor'
for c in list(floor.users_collection):c.objects.unlink(floor)
studio.objects.link(floor);floor.data.materials.append(material('Studio floor',(.10,.11,.12)))
s.cycles.samples=12;s.cycles.use_denoising=True;s.render.resolution_x=640;s.render.resolution_y=640;s.view_settings.view_transform='AgX'
rig['asset_status']='Custom skinned possum with six editable first-pass animation clips.'
rig['controls']='Optional IK disabled for baked clips. Tail bones and mullet bones are editable. Socket bones follow hands.'
rig['forward_axis']='-Y';rig['retarget_root']='pelvis'
s['asset_status']='Theo Meshy 12k custom rig with six motions; not yet imported into Unreal.'
if hasattr(s,'GRT_Action_Bakery'):
    s.GRT_Action_Bakery.clear();s.GRT_Action_Bakery_Global_Settings.Source_Armature=rig
    for action in actions:
        item=s.GRT_Action_Bakery.add();item.Action=action
        bpy.ops.gamerigtool.action_bakery_set_frame_range_to_action(index=len(s.GRT_Action_Bakery)-1)
    report['game_rig_tools']='Registered all six clips'
else:report['game_rig_tools']='Not available in background session; standard Blender actions present'
rig.animation_data.action=actions[0];s.frame_set(1);s.frame_end=49;s.camera=hero
for img in bpy.data.images:
    if img.size[0]>0 and not img.packed_file:img.pack()
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_distance=2.5;area.spaces.active.region_3d.view_location=(0,.08,.55);area.spaces.active.region_3d.view_rotation=hero.rotation_euler.to_quaternion();area.spaces.active.shading.type='MATERIAL'
active(rig)
bpy.ops.wm.save_as_mainfile(filepath=str(R/'theo_rigged_v01.blend'))
body.select_set(True);cig.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(R/'theo_rigged_v01.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_def_bones=True)
bpy.ops.export_scene.fbx(filepath=str(R/'theo_rigged_v01.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,use_armature_deform_only=True,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,axis_forward='-Y',axis_up='Z',path_mode='COPY',embed_textures=True)
for name,cam,act,frame in [('hero',hero,actions[0],1),('rear',rear,actions[0],1),('gameplay',game,actions[0],1),('punch',hero,actions[2],12),('slam_windup',hero,actions[3],12),('slam',hero,actions[3],20),('challenge',hero,actions[4],25),('hit',hero,actions[5],5)]:
    s.camera=cam;rig.animation_data.action=act;s.frame_set(frame);s.render.filepath=str(R/'renders'/f'theo_{name}.png');bpy.ops.render.render(write_still=True)
s.camera=hero;s.render.resolution_x=320;s.render.resolution_y=320;s.cycles.samples=8
for action,(_,length,func,loop) in zip(actions,clip_specs):
    rig.animation_data.action=action;folder=R/'renders'/action.name;folder.mkdir(exist_ok=True)
    for i in range(16):
        frame=1+round(i*(length-1)/15);s.frame_set(frame);s.render.filepath=str(folder/f'{i:03}.png');bpy.ops.render.render(write_still=True)
(R/'theo_rig_validation.json').write_text(json.dumps(report,indent=2))
print('THEO_RIG_DONE',json.dumps(report))
