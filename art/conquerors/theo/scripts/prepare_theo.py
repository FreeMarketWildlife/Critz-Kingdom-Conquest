import bpy, bmesh, json
import numpy as np
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1]
J=R/'meshy_output/20261010_223026_theo-v03_01a12970'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(J/'theo_meshy_12k_v01.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
if len(meshes)>1:bpy.ops.object.join()
o=bpy.context.object;o.name='Theo_Body'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bm=bmesh.new();bm.from_mesh(o.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00002)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
p=np.array([v.co[:] for v in o.data.vertices]);low=p.min(axis=0);high=p.max(axis=0)
scale=1.1/(high[2]-low[2])
for v in o.data.vertices:v.co=(v.co-Vector((0,0,float(low[2]))))*scale
o.data.update()
p=np.array([v.co[:] for v in o.data.vertices])
report={'vertices':len(p),'triangles':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds_min':p.min(axis=0).tolist(),'bounds_max':p.max(axis=0).tolist(),'bands':[]}
for z in np.arange(.05,1.11,.1):
 q=p[(p[:,2]>=z-.05)&(p[:,2]<z+.05)]
 report['bands'].append({'z':round(float(z),2),'min':q.min(axis=0).tolist(),'max':q.max(axis=0).tolist(),'median':np.median(q,axis=0).tolist()})
(R/'theo_preparation.json').write_text(json.dumps(report,indent=2))
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=12;s.render.resolution_x=768;s.render.resolution_y=768;s.render.resolution_percentage=100;s.view_settings.view_transform='Standard'
s.world=bpy.data.worlds.new('Studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.22,.22,.22,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.7
target=Vector((0,0,.55))
for loc,power in [((2,-3,4),450),((-2,-2,2),200),((1,3,2),300)]:
 d=bpy.data.lights.new('Light','AREA');d.energy=power;d.size=2;o=bpy.data.objects.new('Light',d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camera');d.type='ORTHO';d.ortho_scale=1.5;cam=bpy.data.objects.new('Camera',d);s.collection.objects.link(cam);s.camera=cam
(R/'renders').mkdir(exist_ok=True)
for name,loc,tgt in [('rest_front',(0,-4,.55),(0,0,.55)),('rest_side',(4,.1,.55),(0,.1,.55)),('rest_rear',(0,4,.55),(0,0,.55))]:
 cam.location=loc;cam.rotation_euler=(Vector(tgt)-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(R/'renders'/f'{name}.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(R/'theo_prepared_v01.blend'))
print('THEO_PREPARED',json.dumps(report))
