import bpy,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'gorilla_rodin_rigged.blend'))
s=bpy.context.scene;r=bpy.data.objects['Gorilla_Rodin_Rig'];a=sorted([a for a in bpy.data.actions if a.name.startswith('Rodin_')],key=lambda a:a.name)
report={}
if hasattr(s,'GRT_Action_Bakery'):
 s.GRT_Action_Bakery.clear();s.GRT_Action_Bakery_Global_Settings.Source_Armature=r
 for clip in a:
  item=s.GRT_Action_Bakery.add();item.Action=clip
  bpy.ops.gamerigtool.action_bakery_set_frame_range_to_action(index=len(s.GRT_Action_Bakery)-1)
 report['Game Rig Tools']='Six actions registered with frame ranges.'
else:report['Game Rig Tools']='Not loaded in this Blender process; actions are ordinary Blender actions.'
s.camera=bpy.data.objects['Camera_Hero'];s.render.resolution_x=480;s.render.resolution_y=480;s.cycles.samples=8
for name in ['Rodin_Walk','Rodin_HeavyPunch','Rodin_GroundSlam']:
 r.animation_data.action=bpy.data.actions[name]
 folder=R/'renders'/name;folder.mkdir(exist_ok=True)
 for f in range(1,int(r.animation_data.action.frame_range[1])+1,2):
  s.frame_set(f);s.render.filepath=str(folder/f'{f:03}.png')
  if not Path(s.render.filepath).exists():bpy.ops.render.render(write_still=True)
r.animation_data.action=bpy.data.actions['Rodin_Idle'];s.frame_set(1);s.frame_end=49
bpy.ops.object.select_all(action='DESELECT');r.select_set(True);bpy.context.view_layer.objects.active=r
# Hide studio clutter while retaining render lighting and save a timeline instead of console.
for o in bpy.data.collections['STUDIO • not exported'].objects:o.hide_set(True)
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='CONSOLE':area.type='DOPESHEET_EDITOR'
bpy.ops.wm.save_as_mainfile(filepath=str(R/'gorilla_rodin_rigged.blend'))
(R/'rodin_plugin_integration.json').write_text(json.dumps(report,indent=2))
print('PLUGIN_REPORT',report)
