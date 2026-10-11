"""Build an original low-poly silverback, with an editable rig and preview actions.

Run with Blender --background --python this_file.py. No network generation is used.
The scene is created in a separate Blender process, preserving the open user scene.
"""
import bpy
import math
import random
import json
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parents[1]
random.seed(1937)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for action in list(bpy.data.actions):
    bpy.data.actions.remove(action)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.fps = 24
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 1200
scene.render.resolution_y = 1200
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.18, .18, .18)
scene.view_settings.view_transform = 'AgX'
scene.render.film_transparent = False

character = bpy.data.collections.new('GORILLA • model and rig')
studio = bpy.data.collections.new('STUDIO • cameras and lights')
scene.collection.children.link(character)
scene.collection.children.link(studio)

def move_collection(obj, col=character):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    col.objects.link(obj)

def active(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

def material(name, color, roughness=.85, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

fur = material('Painted charcoal fur', (.09,.075,.063))
skin = material('Slate skin', (.095,.098,.092))
dark = material('Mouth and nostril shadow', (.025,.022,.020))
lip = material('Muzzle highlight', (.145,.14,.127))
bronze = material('Weathered bronze', (.255,.155,.063), .8, .08)
edge = material('Bronze worn edges', (.42,.27,.115), .74, .08)
leather = material('Dark leather', (.145,.085,.046))
teal = material('Kingdom cloth • muted teal', (.045,.19,.19))
cloth_edge = material('Faded cloth hem', (.13,.29,.27))
ivory = material('Warm ivory', (.72,.64,.44))
eye = material('Amber eyes', (.68,.40,.08), .55)
pupil = material('Dark pupils', (.016,.015,.013))
meshes = []
bindings = {}

def ellipsoid(name, loc, scale, mat=fur, segments=14, rings=9, bone=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    move_collection(o)
    meshes.append(o)
    if bone: bindings[o.name] = bone
    return o

def mesh(name, verts, faces, mat, bone=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    character.objects.link(obj)
    data.materials.append(mat)
    meshes.append(obj)
    if bone: bindings[obj.name]=bone
    return obj

def limb(name, a, b, radii, mat=fur, bone=None):
    a,b=Vector(a),Vector(b)
    obj=ellipsoid(name,(a+b)/2,(radii[0],radii[1],(b-a).length*.65),mat,bone=bone)
    obj.rotation_mode='QUATERNION'
    obj.rotation_quaternion=(b-a).to_track_quat('Z','Y')
    active(obj)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj

# A connected body rather than a stack of visible primitives.
body_parts=[]
def mass(name, loc, size):
    o=ellipsoid(name,loc,size)
    body_parts.append(o)
    return o

mass('Pelvis',(0,.30,1.25),(.76,.52,.48))
mass('Abdomen',(0,.12,1.75),(.84,.53,.64))
mass('Rib cage',(0,.12,2.25),(1.05,.62,.79))
mass('Trapezius silverback',(0,.25,2.72),(.94,.63,.63))
mass('Sagittal crest',(0,.08,3.14),(.52,.44,.53))
mass('Gorilla skull',(0,-.36,2.92),(.51,.40,.53))
mass('Lower jaw',(0,-.54,2.56),(.45,.36,.36))
for sign,side in [(-1,'L'),(1,'R')]:
    mass('Deltoid '+side,(sign*1.03,.05,2.49),(.56,.57,.61))
    mass('Hip '+side,(sign*.47,.32,1.08),(.43,.43,.56))
    body_parts.append(limb('Upper leg '+side,(sign*.50,.35,1.15),(sign*.58,.25,.66),(.37,.37)))
    body_parts.append(limb('Calf '+side,(sign*.58,.25,.68),(sign*.56,.08,.24),(.31,.30)))
    mass('Foot '+side,(sign*.56,-.06,.19),(.33,.47,.20))
    for i in range(4):
        mass('Toe '+side+str(i),(sign*.56+(i-1.5)*.115,-.40,.13),(.088,.20,.10))
    body_parts.append(limb('Biceps '+side,(sign*1.02,.00,2.43),(sign*1.48,-.16,1.62),(.47,.46)))
    mass('Elbow '+side,(sign*1.48,-.16,1.63),(.40,.40,.42))
    body_parts.append(limb('Forearm '+side,(sign*1.48,-.17,1.65),(sign*1.76,-.48,.70),(.40,.41)))
    mass('Hand '+side,(sign*1.82,-.57,.44),(.39,.41,.34))
    for i in range(4):
        mass('Finger '+side+str(i),(sign*1.82+(i-1.5)*.16,-.80,.215),(.115,.27,.19))
    mass('Thumb '+side,(sign*1.51,-.56,.40),(.15,.21,.20))

active(body_parts[0])
for o in body_parts: o.select_set(True)
bpy.ops.object.join()
body=bpy.context.object
body.name='Gorilla • continuous low-poly body'
remesh=body.modifiers.new('Union sculpt volumes','REMESH')
remesh.mode='VOXEL'
remesh.voxel_size=.052
remesh.use_smooth_shade=False
bpy.ops.object.modifier_apply(modifier=remesh.name)
smooth=body.modifiers.new('Relax union seams','SMOOTH')
smooth.factor=.72
smooth.iterations=5
bpy.ops.object.modifier_apply(modifier=smooth.name)
decimate=body.modifiers.new('Low-poly silhouette budget','DECIMATE')
decimate.ratio=min(1,2600/max(1,len(body.data.polygons)))
bpy.ops.object.modifier_apply(modifier=decimate.name)
body.data.materials.clear()
body.data.materials.append(fur)
meshes=[body]

# Face: a broad muzzle, deep sockets, small eyes and a heavy angled brow.
ellipsoid('Face mask',(0,-.655,2.82),(.375,.11,.365),skin,18,11,'head')
ellipsoid('Chin',(0,-.739,2.43),(.31,.14,.20),skin,14,8,'head')
ellipsoid('Muzzle',(0,-.80,2.59),(.31,.19,.215),lip,16,10,'head')
ellipsoid('Nose bridge',(0,-.812,2.81),(.14,.125,.18),skin,12,8,'head')
ellipsoid('Broad nose',(0,-.94,2.72),(.185,.096,.10),skin,12,7,'head')
for sign in [-1,1]:
    ellipsoid('Nostril '+str(sign),(sign*.072,-1.017,2.713),(.049,.023,.030),dark,10,6,'head')
    ellipsoid('Eye socket '+str(sign),(sign*.176,-.749,2.94),(.14,.052,.096),dark,12,8,'head')
    ellipsoid('Eye amber '+str(sign),(sign*.179,-.787,2.943),(.047,.022,.033),eye,12,7,'head')
    ellipsoid('Eye pupil '+str(sign),(sign*.174,-.811,2.944),(.014,.008,.023),pupil,10,6,'head')
    ellipsoid('Eye catchlight '+str(sign),(sign*.160,-.819,2.958),(.008,.005,.009),ivory,8,5,'head')
    brow=limb('Heavy brow '+str(sign),(sign*.045,-.77,3.006),(sign*.33,-.69,3.084),(.077,.079),fur,'head')
    ellipsoid('Ear '+str(sign),(sign*.479,-.326,2.97),(.094,.074,.13),skin,10,7,'head')
    ellipsoid('Ear inset '+str(sign),(sign*.507,-.379,2.975),(.056,.022,.075),dark,10,7,'head')
    limb('Cheek fur '+str(sign),(sign*.33,-.53,2.80),(sign*.37,-.46,2.44),(.14,.13),fur,'head')
mesh('Closed mouth line',[(-.238,-.965,2.535),(0,-.994,2.553),(.238,-.965,2.535),(.237,-.966,2.511),(0,-.995,2.531),(-.237,-.966,2.511)],[(0,1,4,5),(1,2,3,4)],dark,'head')

# Bronze shoulder shell: a thick, faceted, asymmetric fantasy pauldron.
def pauldron():
    center=Vector((-1.09,-.025,2.69))
    n=10
    verts=[]
    for rx,ry,z in [(.69,.65,-.13),(.66,.61,.16),(.45,.43,.38),(.20,.22,.48)]:
        for i in range(n):
            a=2*math.pi*i/n
            verts.append(tuple(center+Vector((rx*math.cos(a),ry*math.sin(a),z))))
    faces=[]
    for j in range(3):
        for i in range(n): faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    faces.append(tuple(range(3*n,4*n)))
    o=mesh('Bronze • domed shoulder guard',verts,faces,bronze,'upper_arm.L')
    o.data.materials.append(edge)
    for poly in o.data.polygons:
        if poly.index<10: poly.material_index=1
    sol=o.modifiers.new('Forged shell thickness','SOLIDIFY')
    sol.thickness=.055
    active(o);bpy.ops.object.modifier_apply(modifier=sol.name)
    for a in [-2.7,-2.0,-1.3,-.6,.15]:
        p=center+Vector((.68*math.cos(a),.64*math.sin(a),-.035))
        ellipsoid('Pauldron rivet',p,(.048,.048,.045),edge,8,5,'upper_arm.L')
    for dx,dy,z in [(-.30,0,.37),(-.08,-.10,.45),(.17,-.10,.36)]:
        p=center+Vector((dx,dy,z))
        mesh('Forged pauldron ridge',[tuple(p+Vector(v)) for v in [(-.13,-.15,-.04),(.13,-.15,-.04),(.13,.13,-.04),(-.13,.13,-.04),(-.03,-.05,.20)]],[(0,1,4),(1,2,4),(2,3,4),(3,0,4),(0,3,2,1)],edge,'upper_arm.L')
pauldron()

def band(name,center,axis,rx,ry,length,mat,bone,n=12):
    axis=Vector(axis).normalized()
    helper=Vector((0,1,0))
    if abs(axis.dot(helper))>.9: helper=Vector((1,0,0))
    u=axis.cross(helper).normalized();v=axis.cross(u).normalized();c=Vector(center)
    verts=[]
    for offset in [-length/2,length/2]:
        for i in range(n):
            a=2*math.pi*i/n
            verts.append(tuple(c+axis*offset+u*rx*math.cos(a)+v*ry*math.sin(a)))
    faces=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    o=mesh(name,verts,faces,mat,bone)
    return o
for sign,side in [(-1,'L'),(1,'R')]:
    wrist=Vector((sign*1.735,-.425,.87));axis=Vector((sign*.28,-.31,-.95)).normalized()
    band('Leather wrist wrap '+side,wrist,axis,.425,.425,.36,leather,'forearm.'+side)
    for offset in [-.17,.17]:
        band('Bronze bracer rim '+side,wrist+axis*offset,axis,.452,.45,.10,edge,'forearm.'+side)
    band('Bronze bracer plate '+side,wrist,axis,.445,.437,.18,bronze,'forearm.'+side)
    for dx in [-.18,0,.18]:
        ellipsoid('Bracer rivet '+side,(wrist.x+dx,wrist.y-.426,wrist.z),(.035,.024,.034),edge,8,5,'forearm.'+side)

band('Leather waist belt',(0,.08,1.34),(0,0,1),.76,.575,.17,leather,'pelvis',16)
band('Belt edge top',(0,.08,1.425),(0,0,1),.765,.58,.028,bronze,'pelvis',16)
band('Belt edge bottom',(0,.08,1.255),(0,0,1),.765,.58,.028,bronze,'pelvis',16)
ellipsoid('Octagonal bronze buckle',(0,-.524,1.35),(.18,.047,.14),edge,8,6,'pelvis')
ellipsoid('Buckle leather inset',(0,-.568,1.35),(.112,.014,.083),leather,8,6,'pelvis')
mesh('Buckle insignia',[(-.044,-.59,1.35),(0,-.59,1.411),(.044,-.59,1.35),(0,-.59,1.289)],[(0,1,2,3)],bronze,'pelvis')
strap_points=[(-.90,-.49,2.78),(-.72,-.59,2.55),(-.46,-.66,2.29),(-.14,-.64,2.00),(.18,-.57,1.72),(.40,-.48,1.41)]
verts=[]
for x,y,z in strap_points: verts.extend([(x-.10,y-.032,z-.065),(x+.10,y-.032,z+.065)])
strap=mesh('Diagonal leather baldric',verts,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(strap_points)-1)],leather,'chest')
sol=strap.modifiers.new('Leather thickness','SOLIDIFY');sol.thickness=.025
active(strap);bpy.ops.object.modifier_apply(modifier=sol.name)
for x,y,z in strap_points[1:-1]:
    ellipsoid('Strap brass stud',(x,y-.065,z),(.033,.020,.036),bronze,8,5,'chest')

# Tattered front and rear cloth, with two editable ribbon bones.
for back,bone in [(False,'cloth.front'),(True,'cloth.back')]:
    y=.66 if back else -.66
    verts=[(-.28,y,1.27),(.28,y,1.27),(-.30,y+(.08 if back else -.03),.92),(.30,y+(.08 if back else -.03),.92),(-.24,y+(.12 if back else -.08),.55),(-.10,y+(.11 if back else -.08),.62),(-.02,y+(.12 if back else -.08),.50),(.08,y+(.10 if back else -.06),.61),(.19,y+(.10 if back else -.06),.57),(.26,y+(.08 if back else -.06),.72)]
    o=mesh('Teal kingdom tabard '+('rear' if back else 'front'),verts,[(0,1,3,2),(2,3,9,8,7,6,5,4)],teal,bone)
    o.data.materials.append(cloth_edge)
    sol=o.modifiers.new('Cloth thickness','SOLIDIFY');sol.thickness=.012
    active(o);bpy.ops.object.modifier_apply(modifier=sol.name)

# Fur silhouette wedges are separate editable low-poly details, attached to joints.
for sign,side in [(-1,'L'),(1,'R')]:
    for i in range(5):
        x=sign*(.94+i*.105);z=2.65-i*.12
        mesh('Shoulder fur lock '+side+str(i),[(x,-.49,z+.18),(x+sign*.17,-.33,z+.12),(x+sign*.20,-.48,z-.17),(x,-.61,z-.08)],[(0,1,2),(0,2,3)],fur,'upper_arm.'+side)
    for i in range(3):
        x=sign*(.29+i*.065);z=2.69-i*.10
        mesh('Jaw fur lock '+side+str(i),[(x,-.61,z+.15),(x+sign*.12,-.44,z+.08),(x+sign*.08,-.60,z-.15)],[(0,1,2)],fur,'head')

# Unwrap and paint a compact diffuse atlas per material using corner colors.
# This creates real packed image textures, not an external render-only shader.
import numpy as np
def painted_color(mat,p,normal,index):
    base=np.array(mat.diffuse_color[:3],dtype=float)
    x,y,z=p
    noise=(math.sin(x*39+z*27+y*18)+math.sin(x*17-y*41+z*13))*.025
    light=.83+.18*max(0,normal.z)+.08*max(0,-normal.y)
    if mat==fur:
        base=np.array([.031,.027,.025]);noise*=.28
        silver=(max(0,min(1,(y-.18)/.28))*max(0,min(1,(z-1.55)/.65))*max(0,min(1,(3.33-z)/.40)))
        silver*=max(0,1-(abs(x)/1.05)**4)
        base=base*(1-silver)+np.array([.19,.195,.18])*silver
        chest=max(0,1-abs(x)/.8)*max(0,min(1,(-y-.27)/.20))*max(0,1-abs(z-2.0)/.75)
        base+=chest*np.array([.022,.02,.016])
    if mat in [bronze,edge]:
        noise*=2.2
        patina=max(0,math.sin(x*18+y*20+z*15)-.40)*.08
        base+=np.array([-patina,patina*.25,patina*.15])
    if mat==teal:
        light+=max(0,1-abs(x)/.08)*.17
        noise*=.6
    return np.clip(base*light+noise,0.007,1)

live=[o for o in character.objects if o.type=='MESH']
for o in live:
    active(o)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.018)
    bpy.ops.object.mode_set(mode='OBJECT')
    color=o.data.color_attributes.new(name='PaintedColor',type='FLOAT_COLOR',domain='CORNER')
    for poly in o.data.polygons:
        mat=o.data.materials[poly.material_index]
        for li in poly.loop_indices:
            p=o.matrix_world @ o.data.vertices[o.data.loops[li].vertex_index].co
            c=painted_color(mat,p,poly.normal,poly.index)
            color.data[li].color=(*c,1)
    for mat in o.data.materials:
        if not mat.use_nodes: continue
        nodes=mat.node_tree.nodes
        attr=nodes.get('PaintedColor') or nodes.new('ShaderNodeVertexColor')
        attr.name='PaintedColor';attr.layer_name='PaintedColor'
        mat.node_tree.links.new(attr.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])

# Bake the body paint to a portable 1024px diffuse map; keep vertex paint editable.
body_material=fur.copy()
body_material.name='Gorilla body • 1024px painted diffuse'
body.data.materials[0]=body_material
nodes=body_material.node_tree.nodes
links=body_material.node_tree.links
texture=bpy.data.images.new('Gorilla_Body_Diffuse',width=1024,height=1024,alpha=False)
texnode=nodes.new('ShaderNodeTexImage');texnode.image=texture
nodes.active=texnode
emission=nodes.new('ShaderNodeEmission')
links.new(nodes.get('PaintedColor').outputs['Color'],emission.inputs['Color'])
links.new(emission.outputs[0],nodes.get('Material Output').inputs['Surface'])
active(body)
scene.cycles.samples=1
bpy.ops.object.bake(type='EMIT',margin=8,use_clear=True)
texture.filepath_raw=str(ROOT/'textures'/'gorilla_body_diffuse.png')
texture.file_format='PNG';texture.save();texture.pack()
links.new(nodes.get('Principled BSDF').outputs[0],nodes.get('Material Output').inputs['Surface'])
links.new(texnode.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
scene.cycles.samples=32

# Standard deform skeleton with anatomically placed gorilla joints.
arm=bpy.data.armatures.new('Gorilla skeleton')
rig=bpy.data.objects.new('Gorilla_Rig',arm)
character.objects.link(rig)
rig.show_in_front=True
rig.data.display_type='OCTAHEDRAL'
active(rig);bpy.ops.object.mode_set(mode='EDIT')
bone_defs={
 'root':((0,0,.05),(0,0,.40),None),
 'pelvis':((0,.25,1.20),(0,.20,1.65),'root'),
 'spine':((0,.20,1.65),(0,.15,2.16),'pelvis'),
 'chest':((0,.15,2.16),(0,.12,2.68),'spine'),
 'neck':((0,.12,2.68),(0,-.19,2.95),'chest'),
 'head':((0,-.19,2.95),(0,-.30,3.45),'neck'),
 'cloth.front':((0,-.66,1.25),(0,-.72,.64),'pelvis'),
 'cloth.back':((0,.66,1.25),(0,.77,.64),'pelvis')}
for sign,side in [(-1,'L'),(1,'R')]:
    bone_defs.update({
      'clavicle.'+side:((sign*.25,.10,2.60),(sign*1.04,0,2.49),'chest'),
      'upper_arm.'+side:((sign*1.04,0,2.49),(sign*1.48,-.16,1.62),'clavicle.'+side),
      'forearm.'+side:((sign*1.48,-.16,1.62),(sign*1.75,-.47,.71),'upper_arm.'+side),
      'hand.'+side:((sign*1.75,-.47,.71),(sign*1.82,-.82,.27),'forearm.'+side),
      'thigh.'+side:((sign*.48,.32,1.18),(sign*.58,.25,.66),'pelvis'),
      'shin.'+side:((sign*.58,.25,.66),(sign*.56,.08,.25),'thigh.'+side),
      'foot.'+side:((sign*.56,.08,.25),(sign*.56,-.38,.15),'shin.'+side)})
for name,(head,tail,parent) in bone_defs.items():
    b=arm.edit_bones.new(name);b.head=head;b.tail=tail;b.use_deform=name!='root'
    if parent: b.parent=arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
for pb in rig.pose.bones: pb.rotation_mode='XYZ'

def segment_dist(p,a,b):
    a,b=Vector(a),Vector(b);v=b-a
    return (p-(a+v*max(0,min(1,(p-a).dot(v)/v.length_squared)))).length

for o in live:
    if o.name in bindings:
        group=o.vertex_groups.new(name=bindings[o.name]);group.add(list(range(len(o.data.vertices))),1,'REPLACE')
    else:
        groups={name:o.vertex_groups.new(name=name) for name in bone_defs if name!='root' and not name.startswith('cloth')}
        for vert in o.data.vertices:
            p=o.matrix_world@vert.co
            if p.z>2.7 and abs(p.x)<.57: candidates=['head','neck','chest']
            elif abs(p.x)>.90:
                side='R' if p.x>0 else 'L'
                candidates=['upper_arm.'+side,'forearm.'+side,'hand.'+side,'clavicle.'+side]
            elif p.z<1.18:
                side='R' if p.x>0 else 'L';candidates=['thigh.'+side,'shin.'+side,'foot.'+side,'pelvis']
            else: candidates=['pelvis','spine','chest','neck']
            scores=sorted([(segment_dist(p,*bone_defs[n][:2]),n) for n in candidates])[:2]
            weights=[1/(d+.085)**5 for d,n in scores];total=sum(weights)
            for (d,n),w in zip(scores,weights): groups[n].add([vert.index],w/total,'REPLACE')
    modifier=o.modifiers.new('Gorilla skeletal deformation','ARMATURE');modifier.object=rig
    o.parent=rig

# Original in-place preview clips. All rotations are editable keyframes.
def make_action(name,length,pose_function):
    rig.animation_data_create()
    rig.animation_data.action=None
    action=bpy.data.actions.new(name)
    action.use_fake_user=True
    rig.animation_data.action=action
    for frame in range(1,length+1,2):
        scene.frame_set(frame)
        for pb in rig.pose.bones:
            pb.rotation_euler=(0,0,0);pb.location=(0,0,0);pb.scale=(1,1,1)
        pose_function((frame-1)/(length-1))
        for pb in rig.pose.bones:
            pb.keyframe_insert('rotation_euler',frame=frame)
            pb.keyframe_insert('location',frame=frame)
            pb.keyframe_insert('scale',frame=frame)
    # Endpoint key is essential for seamless looping clips.
    scene.frame_set(length)
    for pb in rig.pose.bones: pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
    pose_function(1)
    for pb in rig.pose.bones:
        pb.keyframe_insert('rotation_euler',frame=length);pb.keyframe_insert('location',frame=length);pb.keyframe_insert('scale',frame=length)
    action['description']=name.replace('_',' ')
    return action

def idle(t):
    s=math.sin(t*math.tau)
    rig.pose.bones['chest'].scale=(1+.012*s,1+.020*s,1+.015*s)
    rig.pose.bones['chest'].rotation_euler.x=.012*s
    rig.pose.bones['head'].rotation_euler.z=.025*s
    rig.pose.bones['pelvis'].location.z=.014*s
    for side in ['L','R']: rig.pose.bones['upper_arm.'+side].rotation_euler.x=.025*s

def walk(t):
    s=math.sin(t*math.tau);c=math.cos(t*math.tau)
    rig.pose.bones['pelvis'].location.z=.055*(1-c*c)
    rig.pose.bones['chest'].rotation_euler.z=.055*s
    rig.pose.bones['head'].rotation_euler.z=-.035*s
    for sign,side in [(-1,'L'),(1,'R')]:
        v=s*sign
        rig.pose.bones['upper_arm.'+side].rotation_euler.x=.22*v
        rig.pose.bones['forearm.'+side].rotation_euler.x=-.13*max(0,v)
        rig.pose.bones['hand.'+side].rotation_euler.x=.14*v
        rig.pose.bones['thigh.'+side].rotation_euler.x=-.30*v
        rig.pose.bones['shin.'+side].rotation_euler.x=.25*max(0,-v)
        rig.pose.bones['foot.'+side].rotation_euler.x=.12*v
        rig.pose.bones['cloth.front'].rotation_euler.x=.10*s
        rig.pose.bones['cloth.back'].rotation_euler.x=-.08*s

def attack_pose(t):
    # Anticipation, forward fist impact, then recovery.
    if t<.30: v=t/.30
    elif t<.45: v=1-((t-.30)/.15)*2
    else: v=-1+(t-.45)/.55
    rig.pose.bones['chest'].rotation_euler.z=.16*v
    rig.pose.bones['upper_arm.R'].rotation_euler.x=.75*v
    rig.pose.bones['upper_arm.R'].rotation_euler.z=-.25*v
    rig.pose.bones['forearm.R'].rotation_euler.x=-.50*max(0,v)
    rig.pose.bones['head'].rotation_euler.z=-.12*v
    rig.pose.bones['pelvis'].location.y=.08*v

def roar(t):
    v=math.sin(math.pi*t)**2
    rig.pose.bones['chest'].rotation_euler.x=-.14*v
    rig.pose.bones['head'].rotation_euler.x=-.20*v
    rig.pose.bones['pelvis'].location.z=.06*v
    for sign,side in [(-1,'L'),(1,'R')]:
        rig.pose.bones['upper_arm.'+side].rotation_euler.z=sign*.60*v
        rig.pose.bones['forearm.'+side].rotation_euler.x=-.90*v

actions=[make_action('Gorilla_Idle',49,idle),make_action('Gorilla_KnuckleWalk',33,walk),make_action('Gorilla_HeavyPunch',25,attack_pose),make_action('Gorilla_Challenge',49,roar)]

# Populate the installed Game Rig Tools action bakery with the clips and ranges.
plugin_report={'installed_enabled':list(bpy.context.preferences.addons.keys())}
if hasattr(scene,'GRT_Action_Bakery'):
    scene.GRT_Action_Bakery.clear()
    scene.GRT_Action_Bakery_Global_Settings.Source_Armature=rig
    for action in actions:
        item=scene.GRT_Action_Bakery.add()
        item.Action=action
        bpy.ops.gamerigtool.action_bakery_set_frame_range_to_action(index=len(scene.GRT_Action_Bakery)-1)
    plugin_report['Game Rig Tools']='Four original actions registered in Action Bakery; frame ranges set with its operator.'

rig.animation_data.action=actions[0]
scene.frame_start=1;scene.frame_end=49;scene.frame_set(1)
rig['asset_role']='Editable low-poly Conqueror study; original gorilla anatomy, not a humanoid retarget.'
rig['animation_notes']='Four first-pass FK clips. Polish hand contact and deformation before production use.'

# Studio lighting and two saved cameras: beauty and top-down gameplay.
ground_mat=material('Studio warm grey',(.19,.18,.155))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.055))
floor=bpy.context.object;floor.name='Studio floor';floor.data.materials.append(ground_mat);move_collection(floor,studio)
def area(name,loc,energy,color,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);studio.objects.link(o);o.location=loc
    o.rotation_euler=(Vector((0,0,1.7))-o.location).to_track_quat('-Z','Y').to_euler()
area('Key softbox',(-4,-6,8),950,(1,.87,.69),5)
area('Cool fill',(5,-3,5),650,(.70,.83,1),4)
area('Silverback rim',(1,4,7),1100,(1,.94,.77),3.5)
world=bpy.data.worlds.new('Warm studio world');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.24,.23,.21,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.45
def camera(name,loc,target,ortho):
    data=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,data);studio.objects.link(o);o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=ortho
    return o
beauty=camera('Camera • hero three-quarter',(5,-9,5.1),(0,-.05,1.75),5.0)
rear=camera('Camera • silverback',(-5,8,4.7),(0,0,1.75),5.0)
gameplay=camera('Camera • gameplay',(5,-7,10),(0,0,1.65),5.0)
scene.camera=beauty

# Save a model-only neutral viewport with lights and floor hidden in the viewport.
for o in studio.objects:
    o.hide_set(True)
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':
            space=area_ui.spaces.active
            space.shading.type='MATERIAL'
            space.region_3d.view_distance=6.1
            space.region_3d.view_location=(0,0,1.75)
            space.region_3d.view_rotation=beauty.rotation_euler.to_quaternion()
            space.overlay.show_floor=False
active(body)

scene['plugin_report']=json.dumps(plugin_report)
scene['reference_image']='reference/gorilla-style-reference.png'
scene['status']='First editable model and animation study, pending art-direction approval.'
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'gorilla_conqueror_v01.blend'))

# Render three views for honest visual QA.
for name,cam in [('hero',beauty),('rear',rear),('gameplay',gameplay)]:
    scene.camera=cam
    scene.render.filepath=str(ROOT/'renders'/f'gorilla_{name}.png')
    bpy.ops.render.render(write_still=True)

scene.camera=beauty
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'gorilla_conqueror_v01.blend'))
report={'blender':bpy.app.version_string,'mesh_objects':len(live),'triangles':sum(len(o.data.loop_triangles) for o in live),'bones':len(arm.bones),'actions':[a.name for a in actions],'plugins':plugin_report}
for o in live:o.data.calc_loop_triangles()
report['triangles']=sum(len(o.data.loop_triangles) for o in live)
(ROOT/'build_report.json').write_text(json.dumps(report,indent=2))
print('GORILLA_BUILD_COMPLETE',json.dumps(report))
