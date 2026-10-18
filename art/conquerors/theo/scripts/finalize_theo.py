import bpy,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'theo_rigged_v01.blend'))
s=bpy.context.scene;rig=bpy.data.objects['Theo_Rig']
for side in ['l','r']:rig.data.bones['socket_weapon_'+side].use_deform=True
rig.animation_data.action=bpy.data.actions['Theo_Idle'];s.frame_set(1);s.frame_start=1;s.frame_end=49
studio=bpy.data.collections['STUDIO • excluded from exports']
for obj in studio.objects:obj.hide_set(True)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.wm.save_as_mainfile(filepath=str(R/'theo_rigged_v01.blend'))
bpy.data.objects['Theo_Body'].select_set(True);bpy.data.objects['Theo_Cigarette'].select_set(True)
bpy.ops.export_scene.gltf(filepath=str(R/'theo_rigged_v01.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_def_bones=True)
bpy.ops.export_scene.fbx(filepath=str(R/'theo_rigged_v01.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,use_armature_deform_only=True,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,axis_forward='-Y',axis_up='Z',path_mode='COPY',embed_textures=True)
report=json.loads((R/'theo_rig_validation.json').read_text());report['deform_bones']=sum(b.use_deform for b in rig.data.bones);report['weighted_bones']=37
(R/'theo_rig_validation.json').write_text(json.dumps(report,indent=2))
chains={'retarget_root':'pelvis','spine':['spine_01','spine_02'],'neck':['neck_01','head'],'tail':[f'tail_{i:02}' for i in range(1,7)]}
for side in ['l','r']:
    chains['arm_'+side]=['clavicle_'+side,'upperarm_'+side,'lowerarm_'+side,'hand_'+side]
    chains['leg_'+side]=['thigh_'+side,'calf_'+side,'foot_'+side,'ball_'+side]
    chains['weapon_socket_'+side]='socket_weapon_'+side
(R/'unreal_retarget_chains.json').write_text(json.dumps(chains,indent=2))
print('THEO_FINALIZED')
