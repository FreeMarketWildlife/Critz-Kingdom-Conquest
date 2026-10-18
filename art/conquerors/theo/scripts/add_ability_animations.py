"""Add fictional pipe-use and moonshine-drinking abilities to the existing Theo rig.
Creates separate game props and a v02 character; preserves the v01 deliverables.
"""
import bpy, math, json, ast
import numpy as np
from pathlib import Path
from mathutils import Vector, Quaternion, Matrix
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'theo_rigged_v01.blend'))
s=bpy.context.scene;rig=bpy.data.objects['Theo_Rig'];arm=rig.data;body=bpy.data.objects['Theo_Body'];cig=bpy.data.objects['Theo_Cigarette'];char=bpy.data.collections['THEO • character and rig']
B={b.name:(tuple(b.head_local),tuple(b.tail_local),b.parent.name if b.parent else None) for b in arm.bones}
tail=[B[f'tail_{i:02}'][0] for i in range(1,7)]+[B['tail_06'][1]]
hand_targets={};hand_directions={}
# Reuse the established rig's posing helpers without regenerating its geometry/actions.
source=ast.parse((R/'scripts'/'rig_theo.py').read_text())
wanted={'active','material','rotate','shift','reset','point_bone','legs','arms','tail_pose','fist','stance'}
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in wanted],type_ignores=[]),'<theo_pose_helpers>','exec'),globals())
def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.65
    return m
originals=[a for a in bpy.data.actions if a.name.startswith('Theo_')]
assert len(originals)==6
P=R/'props';P.mkdir(exist_ok=True);renders=R/'renders'/'abilities';renders.mkdir(exist_ok=True)
def cylinder(name,radius,depth,loc,mat,vertices=10):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat);return o
def sphere(name,radius,loc,mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=radius,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat);return o
def join(parts,name):
    active(parts[0])
    for o in parts:o.select_set(True)
    bpy.ops.object.join();o=bpy.context.object;o.name=name;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    return o
amber=material('Moonshine painted amber glass',(.23,.14,.045));label=material('Moonshine worn paper',(.64,.56,.36));dark=material('Prop openings',(.028,.023,.018))
glass=material('Pipe cloudy glass',(.29,.34,.33));glassrough=glass
for mat in [amber,glass]:
    mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.38
parts=[cylinder('Bottle body',.043,.125,(0,0,.073),amber,8),cylinder('Bottle shoulder',.032,.025,(0,0,.146),amber,8),cylinder('Bottle neck',.015,.050,(0,0,.180),amber,8),cylinder('Bottle lip',.018,.009,(0,0,.209),amber,8),cylinder('Bottle opening',.011,.001,(0,0,.214),dark,8)]
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-.040,.082));o=bpy.context.object;o.scale=(.041,.004,.052);o.data.materials.append(label);parts.append(o)
bottle=join(parts,'Theo_Moonshine_Bottle')
bottle['prop_type']='Separate intact moonshine bottle; local origin at bottom; uncorked for drinking.'
active(bottle);bpy.ops.export_scene.gltf(filepath=str(P/'theo_moonshine_bottle_v01.glb'),use_selection=True,export_animations=False)
parts=[]
o=cylinder('Pipe stem',.007,.10,(0,-.05,0),glass,8);o.rotation_euler[0]=math.pi/2;parts.append(o)
parts.append(sphere('Pipe bowl',.018,(0,-.105,0),glass));parts.append(cylinder('Pipe bowl opening',.008,.002,(0,-.105,.016),dark,8))
pipe=join(parts,'Theo_Crack_Pipe');pipe['prop_type']='Stylized fictional ability prop; no lighter or preparation animation.'
active(pipe);bpy.ops.export_scene.gltf(filepath=str(P/'theo_crack_pipe_v01.glb'),use_selection=True,export_animations=False)

# Rigid prop bones let GLB/FBX carry prop visibility and contact as part of each clip.
active(rig);bpy.ops.object.mode_set(mode='EDIT')
new_bones={
 'prop_moonshine':((.397,-.17,.39),(.397,-.17,.49),'socket_weapon_r'),
 'prop_pipe':((.397,-.17,.39),(.397,-.27,.39),'socket_weapon_r'),
 'prop_cigarette':((.045,-.318,.79),(.10,-.423,.755),'head'),
 'fx_smoke_01':((.045,-.34,.79),(.045,-.34,.85),'head'),
 'fx_smoke_02':((.045,-.34,.79),(.045,-.34,.85),'head'),
 'fx_smoke_03':((.045,-.34,.79),(.045,-.34,.85),'head'),
}
for name,(h,t,parent) in new_bones.items():
    b=arm.edit_bones.new(name);b.head=h;b.tail=t;b.parent=arm.edit_bones[parent];b.use_deform=True
bpy.ops.object.mode_set(mode='OBJECT')
for name in new_bones:rig.pose.bones[name].rotation_mode='QUATERNION'
def bind(o,bone):
    for c in list(o.users_collection):c.objects.unlink(o)
    char.objects.link(o);o.vertex_groups.clear();g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
    for m in list(o.modifiers):
        if m.type=='ARMATURE':o.modifiers.remove(m)
    m=o.modifiers.new('Rigid prop follows ability bone','ARMATURE');m.object=rig;o.parent=rig
# Move standalone meshes into their attachment rest positions without changing their originals.
for v in bottle.data.vertices:v.co+=Vector(new_bones['prop_moonshine'][0])-Vector((0,0,.183))
for v in pipe.data.vertices:v.co+=Vector(new_bones['prop_pipe'][0])
bind(bottle,'prop_moonshine');bind(pipe,'prop_pipe');bind(cig,'prop_cigarette')
smoke_mat=material('Ability smoke',(.36,.38,.36));smoke=[]
for i in range(1,4):
    o=sphere('Theo_Ability_Smoke_'+str(i),.025,Vector(new_bones[f'fx_smoke_{i:02}'][0]),smoke_mat);bind(o,f'fx_smoke_{i:02}');smoke.append(o)
props=[bottle,pipe,*smoke]
def hidden(name,hide=True):rig.pose.bones[name].scale=(.0001,.0001,.0001) if hide else (1,1,1)
def defaults():
    for name in new_bones:
        p=rig.pose.bones[name];p.location=(0,0,0);p.rotation_quaternion=Quaternion();p.scale=(1,1,1)
        hidden(name,name!='prop_cigarette')
def key_new(frame):
    for name in new_bones:
        p=rig.pose.bones[name]
        for path in ['location','rotation_quaternion','scale']:p.keyframe_insert(path,frame=frame)
for action in originals:
    rig.animation_data.action=action
    for frame in [int(action.frame_range[0]),int(action.frame_range[1])]:
        s.frame_set(frame);defaults();key_new(frame)

def smooth(u):u=max(0,min(1,u));return u*u*(3-2*u)
def envelope(t):
    return smooth((t-.08)/.25)*(1-smooth((t-.72)/.20))
def head_point(p):
    bpy.context.view_layer.update();return (rig.pose.bones['head'].matrix@arm.bones['head'].matrix_local.inverted())@Vector(p)
def move_prop(name,pos,axis,scale=1):
    pb=rig.pose.bones[name];q=(pb.bone.tail_local-pb.bone.head_local).rotation_difference(Vector(axis).normalized())
    mat=q.to_matrix().to_4x4()@pb.bone.matrix_local.to_3x3().to_4x4();mat.translation=pos;pb.matrix=mat;pb.scale=(scale,scale,scale);bpy.context.view_layer.update()

records={};actions=[]
for name,kind in [('Theo_MoonshineDrink','drink'),('Theo_CrackAbility','pipe')]:
    action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action;record=[]
    for frame in range(1,74):
        t=(frame-1)/72;v=envelope(t);s.frame_set(frame);reset();defaults();stance(t)
        breath=math.sin(t*math.tau*4)*v
        if kind=='drink':
            rotate('head',(1,0,0),-.20*v);rotate('neck_01',(1,0,0),-.08*v)
            rotate('spine_02',(1,0,0),-.035*v);shift('pelvis',(0,0,.003*breath))
        else:
            rotate('head',(1,0,0),.08*v+.025*breath);rotate('spine_02',(1,0,0),.02*breath)
        mouth=head_point((.045,-.318,.79))
        rest_wrist=Vector((.245,-.14,.40))
        if kind=='drink':
            # Bottle goes from upright carry to tipped-back contact at the mouth.
            tilt=Quaternion(Vector((1,0,0)),-math.radians(112)*v)
            axis=tilt@Vector((0,0,1));grip=mouth-axis*.032
            desired_wrist=grip+Vector((.022,.020,.025))
            hand_targets['r']=rest_wrist.lerp(desired_wrist,v);hand_directions['r']=tuple((-axis*.65+Vector((0,0,-.35))).normalized())
        else:
            axis=Vector((0,-1,0));tip=mouth
            desired_wrist=tip+axis*.060+Vector((.025,.01,.035))
            hand_targets['r']=rest_wrist.lerp(desired_wrist,v);hand_directions['r']=(0,-.8,-.6)
        fist('r',.4+.25*v)
        legs({side:Vector(B['foot_'+side][0]) for side in ['l','r']});arms();tail_pose(t)
        wrist=rig.pose.bones['hand_r'].head.copy()
        if kind=='drink':
            carry=wrist+Vector((-.014,-.012,-.035));grip=carry.lerp(grip,v)
            move_prop('prop_moonshine',grip,axis)
            contact=grip+axis*.031
        else:
            carry=wrist+Vector((-.025,.050,-.035));tip=carry.lerp(mouth,v)
            move_prop('prop_pipe',tip,axis);contact=tip
        hidden('prop_cigarette',v>.12)
        # Small stylized exhale puffs are independent meshes, not game logic.
        if kind=='pipe':
            for i in range(1,4):
                progress=(t-(.46+i*.055))/.25
                if 0<progress<1:
                    pos=mouth+Vector((.012*i,-.05-.12*progress,.025+.09*progress))
                    move_prop(f'fx_smoke_{i:02}',pos,(0,0,1),math.sin(progress*math.pi)*(1+progress*.7))
        bpy.context.view_layer.update()
        for pb in rig.pose.bones:
            if pb.name.startswith('CTRL_'):continue
            for path in ['rotation_quaternion','location','scale']:pb.keyframe_insert(path,frame=frame)
        record.append({'frame':frame,'contact_phase':v>.99,'mouth_error_m':(contact-mouth).length,'wrist_target_error_m':(wrist-hand_targets['r']).length})
    action['ability']='Moonshine drink' if kind=='drink' else 'Fictional crack-pipe use';action['loop']=False
    action['duration_seconds']=3;action['gameplay_status']='Animation only; stat bonuses, cooldown and combat rules are not implemented.'
    actions.append(action);records[name]=record

# Inspect every frame for finite skinning, floor contact and prop-to-mouth placement.
validation={'fps':24,'new_clips':{},'props':{},'total_clips':8}
for action in actions:
    rig.animation_data.action=action;lowest=1;bad=0
    for frame in range(1,74):
        s.frame_set(frame);ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();coords=np.array([v.co[:] for v in mesh.vertices]);ev.to_mesh_clear()
        bad+=int((~np.isfinite(coords)).sum());lowest=min(lowest,float(coords[:,2].min()))
    hold=[r for r in records[action.name] if r['contact_phase']]
    validation['new_clips'][action.name]={'frames':73,'seconds':3,'nonfinite_values':bad,'lowest_point_m':round(lowest,6),'max_mouth_contact_error_m':round(max(r['mouth_error_m'] for r in hold),6),'max_wrist_target_error_m':round(max(r['wrist_target_error_m'] for r in records[action.name]),6)}
    assert bad==0 and lowest>-.002 and max(r['mouth_error_m'] for r in hold)<.003
for o in [bottle,pipe]:validation['props'][o.name]={'triangles':sum(len(p.vertices)-2 for p in o.data.polygons),'separate_model':True}
(R/'theo_ability_validation.json').write_text(json.dumps(validation,indent=2))
if hasattr(s,'GRT_Action_Bakery'):
    s.GRT_Action_Bakery.clear();s.GRT_Action_Bakery_Global_Settings.Source_Armature=rig
    for action in originals+actions:
        item=s.GRT_Action_Bakery.add();item.Action=action;bpy.ops.gamerigtool.action_bakery_set_frame_range_to_action(index=len(s.GRT_Action_Bakery)-1)
rig.animation_data.action=bpy.data.actions['Theo_Idle'];s.frame_set(1);s.frame_end=49;s.camera=bpy.data.objects['Camera_Hero']
active(rig);bpy.ops.wm.save_as_mainfile(filepath=str(R/'theo_rigged_v02.blend'))
for o in [body,cig,*props]:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(R/'theo_rigged_v02.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_def_bones=True)
bpy.ops.export_scene.fbx(filepath=str(R/'theo_rigged_v02.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,use_armature_deform_only=True,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,axis_forward='-Y',axis_up='Z',path_mode='COPY',embed_textures=True)
for obj in bpy.data.collections['STUDIO • excluded from exports'].objects:obj.hide_set(False)
s.camera=bpy.data.objects['Camera_Hero'];s.render.resolution_x=480;s.render.resolution_y=480;s.cycles.samples=12
for action in actions:
    rig.animation_data.action=action;folder=renders/action.name;folder.mkdir(exist_ok=True)
    for i in range(25):
        frame=1+i*3;s.frame_set(frame);s.render.filepath=str(folder/f'{i:03}.png');bpy.ops.render.render(write_still=True)
print('THEO_ABILITIES_DONE',json.dumps(validation))
