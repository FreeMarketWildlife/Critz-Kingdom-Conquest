"""Round-trip inspect Theo GLB/FBX and compare posed geometry to Blender source."""
import bpy,json,struct,math
from pathlib import Path
import numpy as np
R=Path(__file__).resolve().parents[1]
expected={'Theo_Idle':49,'Theo_Walk':33,'Theo_HeavyPunch':25,'Theo_GroundSlam':37,'Theo_Challenge':49,'Theo_HitReact':19}
bpy.ops.wm.open_mainfile(filepath=str(R/'theo_rigged_v01.blend'))
rig=bpy.data.objects['Theo_Rig'];body=bpy.data.objects['Theo_Body'];source={}
for name,length in expected.items():
    rig.animation_data.action=bpy.data.actions[name];source[name]={}
    for frame in [1,round((length+1)/2),length]:
        bpy.context.scene.frame_set(frame);ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();p=np.array([(body.matrix_world@v.co)[:] for v in mesh.vertices]);ev.to_mesh_clear()
        source[name][frame]=[p.min(axis=0),p.max(axis=0)]
raw=(R/'theo_rigged_v01.glb').read_bytes();magic,version,size=struct.unpack_from('<III',raw,0);chunklen,kind=struct.unpack_from('<II',raw,12);doc=json.loads(raw[20:20+chunklen])
assert magic==0x46546c67 and version==2 and size==len(raw)
assert set(a['name'] for a in doc['animations'])==set(expected)
assert len(doc['skins'])>=1 and not doc.get('cameras')
assert any(n['name']=='Theo_Cigarette' for n in doc['nodes'])
assert all(any(n['name']=='socket_weapon_'+side for n in doc['nodes']) for side in ['l','r'])
gltf={'animations':[a['name'] for a in doc['animations']],'skin_joints':len(doc['skins'][0]['joints']),'meshes':len(doc['meshes']),'images':len(doc['images']),'bytes':len(raw),'clips':{}}
for animation in doc['animations']:
    times=[doc['accessors'][sampler['input']] for sampler in animation['samplers']]
    maximum=max(a['max'][0] for a in times);minimum=min(a['min'][0] for a in times);name=animation['name']
    assert abs(maximum-minimum-(expected[name]-1)/24)<.0001
    gltf['clips'][name]={'duration_seconds':round(maximum-minimum,6),'channels':len(animation['channels'])}
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=24
bpy.ops.import_scene.gltf(filepath=str(R/'theo_rigged_v01.glb'))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');body=next(o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith('Theo_Body'))
errors={}
for name,length in expected.items():
    action=next(a for a in bpy.data.actions if a.name==name);rig.animation_data.action=action;errors[name]=[]
    for frame in [1,round((length+1)/2),length]:
        bpy.context.scene.frame_set(frame);ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();p=np.array([(body.matrix_world@v.co)[:] for v in mesh.vertices]);ev.to_mesh_clear()
        assert np.isfinite(p).all()
        err=max(float(np.abs(p.min(axis=0)-source[name][frame][0]).max()),float(np.abs(p.max(axis=0)-source[name][frame][1]).max()))
        errors[name].append(err)
gltf['roundtrip_max_bounds_error_m']={k:round(max(v),6) for k,v in errors.items()}
assert max(max(v) for v in errors.values())<.005
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=24
bpy.ops.import_scene.fbx(filepath=str(R/'theo_rigged_v01.fbx'))
fbx={'armatures':sum(o.type=='ARMATURE' for o in bpy.context.scene.objects),'meshes':sum(o.type=='MESH' for o in bpy.context.scene.objects),'actions':[],'images':len(bpy.data.images),'bytes':(R/'theo_rigged_v01.fbx').stat().st_size}
for a in bpy.data.actions:fbx['actions'].append({'name':a.name,'frames':list(a.frame_range)})
assert fbx['armatures']==1 and fbx['meshes']==2 and len(fbx['actions'])==6
assert all(any(name in a['name'] for a in fbx['actions']) for name in expected)
report={'passed':True,'glb':gltf,'fbx':fbx}
(R/'theo_export_validation.json').write_text(json.dumps(report,indent=2));print('THEO_EXPORT_CHECK',json.dumps(report))
