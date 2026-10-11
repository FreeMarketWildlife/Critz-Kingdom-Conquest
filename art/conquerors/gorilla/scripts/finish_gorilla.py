import bpy, json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'gorilla_conqueror_v01.blend'))
s=bpy.context.scene
rig=next(o for o in s.objects if o.type=='ARMATURE')
meshes=[o for o in s.objects if o.type=='MESH' and o.parent==rig]
errors=[]
for o in meshes:
 for v in o.data.vertices:
  if not v.groups or abs(sum(g.weight for g in v.groups)-1)>0.02: errors.append(o.name);break
for a in bpy.data.actions:
 rig.animation_data.action=a
 for frame in [1,int(a.frame_range[1]/2),int(a.frame_range[1])]:
  s.frame_set(frame)
  for o in meshes:
   ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get())
   if any(not all(math.isfinite(x) for x in v.co) for v in ev.data.vertices):errors.append(o.name+' nonfinite')
assert not errors,errors
rig.animation_data.action=bpy.data.actions['Gorilla_Idle'];s.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for o in meshes+[rig]:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(ROOT/'gorilla_conqueror_v01.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS')
(ROOT/'validation.json').write_text(json.dumps({'weighted_meshes':len(meshes),'weight_checks':'passed','finite_deformation_checks':'passed','export':'gorilla_conqueror_v01.glb'},indent=2))
s.render.resolution_x=560;s.render.resolution_y=560;s.cycles.samples=8
rig.animation_data.action=bpy.data.actions['Gorilla_KnuckleWalk']
for frame in range(1,33,2):
 s.frame_set(frame);s.render.filepath=str(ROOT/'renders'/f'walk_{frame:02}.png');bpy.ops.render.render(write_still=True)
rig.animation_data.action=bpy.data.actions['Gorilla_HeavyPunch'];s.frame_set(11)
s.render.filepath=str(ROOT/'renders'/'gorilla_punch.png');bpy.ops.render.render(write_still=True)
print('VALIDATION_AND_PREVIEW_COMPLETE')
