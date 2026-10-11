"""Transfer confirmed Rodin material/UVs to welded, rigged mesh and export previews."""
import bpy,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'gorilla_rodin_rigged.blend'))
s=bpy.context.scene;body=bpy.data.objects['Gorilla_Rodin_Body'];rig=bpy.data.objects['Gorilla_Rodin_Rig']
old=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(R/'gorilla_rodin_textured.glb'))
new=[o for o in bpy.data.objects if o not in old]
source=next(o for o in new if o.type=='MESH')
# Coordinate-based face correspondence survives UV seam vertex splits.
def point(v):return tuple(round(c,5) for c in v)
def signature(mesh,poly):return tuple(sorted(point(mesh.vertices[i].co) for i in poly.vertices))
uv=source.data.uv_layers.active
mapping={signature(source.data,p):p for p in source.data.polygons}
matched=0
for p in body.data.polygons:
 q=mapping.get(signature(body.data,p))
 if q is None:continue
 lookup={point(source.data.vertices[source.data.loops[i].vertex_index].co):uv.data[i].uv.copy() for i in q.loop_indices}
 for i in p.loop_indices:body.data.uv_layers.active.data[i].uv=lookup[point(body.data.vertices[body.data.loops[i].vertex_index].co)]
 p.material_index=q.material_index;matched+=1
assert matched==len(body.data.polygons),f'UV geometry mismatch: {matched}/{len(body.data.polygons)}'
body.data.materials.clear()
for m in source.data.materials:body.data.materials.append(m)
images=[]
for m in body.data.materials:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE' and n.image:
   im=n.image;im.pack();images.append({'name':im.name,'width':im.size[0],'height':im.size[1]})
   im.filepath_raw=str(R/'textures'/('rodin_'+im.name.replace('/','_')+'.png'));im.file_format='PNG';im.save()
for o in new:bpy.data.objects.remove(o,do_unlink=True)
s['asset_status']='Confirmed Rodin textures with cleaned mesh, prototype skinning and six editable motion studies.'
rig.animation_data.action=bpy.data.actions['Rodin_Idle'];s.frame_set(1);s.frame_end=49
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);body.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(R/'gorilla_rodin_rigged.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS')
bpy.ops.export_scene.fbx(filepath=str(R/'gorilla_rodin_rigged.fbx'),use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,use_armature_deform_only=True,bake_anim=True,bake_anim_use_all_actions=True,axis_forward='-Y',axis_up='Z',path_mode='COPY',embed_textures=True)
s.camera=bpy.data.objects['Camera_Hero'];s.render.resolution_x=900;s.render.resolution_y=900;s.cycles.samples=24
bpy.ops.wm.save_as_mainfile(filepath=str(R/'gorilla_rodin_rigged.blend'))
for name,cam,action,frame in [('hero','Camera_Hero','Rodin_Idle',1),('rear','Camera_Rear','Rodin_Idle',1),('gameplay','Camera_Gameplay','Rodin_Idle',1),('punch','Camera_Hero','Rodin_HeavyPunch',11),('slam','Camera_Hero','Rodin_GroundSlam',19)]:
 s.camera=bpy.data.objects[cam];rig.animation_data.action=bpy.data.actions[action];s.frame_set(frame);s.render.filepath=str(R/'renders'/('rodin_textured_'+name+'.png'));bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['Camera_Hero'];s.render.resolution_x=480;s.render.resolution_y=480;s.cycles.samples=8
for name in ['Rodin_Walk','Rodin_HeavyPunch','Rodin_GroundSlam']:
 rig.animation_data.action=bpy.data.actions[name];folder=R/'renders'/(name+'_textured');folder.mkdir(exist_ok=True)
 for f in range(1,int(rig.animation_data.action.frame_range[1])+1,2):
  s.frame_set(f);s.render.filepath=str(folder/f'{f:03}.png');bpy.ops.render.render(write_still=True)
(R/'rodin_texture_validation.json').write_text(json.dumps({'matched_uv_faces':matched,'total_faces':len(body.data.polygons),'packed_images':images},indent=2))
print('TEXTURE_TRANSFER_COMPLETE',matched,images)
