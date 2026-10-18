import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
JOB = ROOT / 'meshy_output/20261010_223026_theo-v03_01a12970'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(JOB / 'theo_meshy_textured_v01.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
points = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
low = Vector([min(p[i] for p in points) for i in range(3)])
high = Vector([max(p[i] for p in points) for i in range(3)])
center = (low + high) / 2
span = max(high - low)
report = {
    'source': 'theo_meshy_textured_v01.glb',
    'task_id': '01a12970-c0a9-7410-800f-52293de58c21',
    'resource': 'image-to-3d',
    'consumed_credits': 30,
    'mesh_objects': len(meshes),
    'vertices': sum(len(o.data.vertices) for o in meshes),
    'polygons': sum(len(o.data.polygons) for o in meshes),
    'triangles': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes),
    'armatures': len([o for o in bpy.context.scene.objects if o.type == 'ARMATURE']),
    'bounds_min': list(low),
    'bounds_max': list(high),
    'materials': [m.name for m in bpy.data.materials],
    'images': [{'name': i.name, 'size': list(i.size), 'packed': bool(i.packed_file)} for i in bpy.data.images],
}
(JOB / 'local_inspection.json').write_text(json.dumps(report, indent=2))
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.render.resolution_x = 768
scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.world = bpy.data.worlds.new('Neutral studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.22, .22, .22, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .6
scene.view_settings.view_transform = 'Standard'
studio = bpy.data.collections.new('Inspection studio')
scene.collection.children.link(studio)
for name, offset, energy in [('Key', (2, -3, 4), 700), ('Fill', (-3, -1, 2), 350), ('Rear', (1, 3, 3), 500)]:
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = span * 1.5
    obj = bpy.data.objects.new(name, data)
    studio.objects.link(obj)
    obj.location = center + Vector(offset) * span
    obj.rotation_euler = (center - obj.location).to_track_quat('-Z', 'Y').to_euler()
data = bpy.data.cameras.new('Inspection camera')
camera = bpy.data.objects.new('Inspection camera', data)
studio.objects.link(camera)
data.type = 'ORTHO'
data.ortho_scale = span * 1.3
scene.camera = camera
for name, offset in [('front', (2, -4, 1.2)), ('rear', (-2, 4, 1.2))]:
    camera.location = center + Vector(offset) * span
    camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(JOB / f'inspection_{name}.png')
    bpy.ops.render.render(write_still=True)
camera.location = center + Vector((2, -4, 1.2)) * span
camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
for image in bpy.data.images:
    if image.size[0] > 0 and not image.packed_file:
        image.pack()
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.shading.type = 'MATERIAL'
            area.spaces.active.region_3d.view_location = center
            area.spaces.active.region_3d.view_distance = span * 1.5
bpy.ops.wm.save_as_mainfile(filepath=str(JOB / 'theo_meshy_textured_v01.blend'))
print('THEO_INSPECTION', json.dumps(report))
