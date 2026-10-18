import bpy,json,struct
import numpy as np
from pathlib import Path
R=Path(__file__).resolve().parents[1]
old={'Theo_Idle':49,'Theo_Walk':33,'Theo_HeavyPunch':25,'Theo_GroundSlam':37,'Theo_Challenge':49,'Theo_HitReact':19}
expected={**old,'Theo_MoonshineDrink':73,'Theo_CrackAbility':73}
def bounds(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();p=np.array([(obj.matrix_world@v.co)[:] for v in mesh.vertices]);ev.to_mesh_clear()
    assert np.isfinite(p).all();return np.array([p.min(axis=0),p.max(axis=0)])
def snapshot(path,clips):
    bpy.ops.wm.open_mainfile(filepath=str(path));s=bpy.context.scene;r=bpy.data.objects['Theo_Rig'];body=bpy.data.objects['Theo_Body'];data={}
    for name,length in clips.items():
        r.animation_data.action=bpy.data.actions[name];data[name]={}
        for frame in [1,(length+1)//2,length]:s.frame_set(frame);data[name][frame]=bounds(body)
    return data
before=snapshot(R/'theo_rigged_v01.blend',old);after=snapshot(R/'theo_rigged_v02.blend',expected)
unchanged={name:float(max(np.abs(before[name][f]-after[name][f]).max() for f in before[name])) for name in old}
assert max(unchanged.values())<.000001
def document(path):
    raw=path.read_bytes();magic,version,size=struct.unpack_from('<III',raw,0);length,kind=struct.unpack_from('<II',raw,12)
    assert magic==0x46546c67 and version==2 and size==len(raw)
    return json.loads(raw[20:20+length])
doc=document(R/'theo_rigged_v02.glb');assert set(a['name'] for a in doc['animations'])==set(expected)
durations={}
for animation in doc['animations']:
    times=[doc['accessors'][sampler['input']] for sampler in animation['samplers']]
    duration=max(a['max'][0] for a in times)-min(a['min'][0] for a in times);durations[animation['name']]=duration
    assert abs(duration-(expected[animation['name']]-1)/24)<.00001
assert not doc.get('cameras')
standalone={}
for name in ['theo_moonshine_bottle_v01','theo_crack_pipe_v01']:
    d=document(R/'props'/f'{name}.glb');assert len(d['meshes'])==1 and not d.get('skins') and not d.get('animations')
    standalone[name]={'meshes':1,'rig_required':False,'animations':0}
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=24;bpy.ops.import_scene.gltf(filepath=str(R/'theo_rigged_v02.glb'))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');body=bpy.data.objects['Theo_Body'];errors={};visibility={}
for name,length in expected.items():
    rig.animation_data.action=bpy.data.actions[name];errors[name]=[]
    for frame in [1,(length+1)//2,length]:
        bpy.context.scene.frame_set(frame);errors[name].append(float(np.abs(bounds(body)-after[name][frame]).max()))
    bpy.context.scene.frame_set((length+1)//2);visibility[name]={}
    for prop in ['Theo_Moonshine_Bottle','Theo_Crack_Pipe']:
        bb=bounds(bpy.data.objects[prop]);span=float((bb[1]-bb[0]).max());visibility[name][prop]=span
        should_show=(name=='Theo_MoonshineDrink' and prop=='Theo_Moonshine_Bottle') or (name=='Theo_CrackAbility' and prop=='Theo_Crack_Pipe')
        assert (span>.03) if should_show else (span<.0001)
assert max(max(v) for v in errors.values())<.005
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=24;bpy.ops.import_scene.fbx(filepath=str(R/'theo_rigged_v02.fbx'))
fbx=[a.name for a in bpy.data.actions];assert len(fbx)==8 and all(any(name in a for a in fbx) for name in expected)
result={'passed':True,'original_six_max_bounds_difference_m':unchanged,'glb_durations_seconds':durations,'glb_roundtrip_bounds_error_m':{k:max(v) for k,v in errors.items()},'prop_visibility_spans_m':visibility,'standalone_props':standalone,'fbx_actions':fbx}
(R/'theo_ability_export_validation.json').write_text(json.dumps(result,indent=2));print('THEO_ABILITIES_EXPORT_CHECK',json.dumps(result))
