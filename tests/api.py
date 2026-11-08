"""Local integration test. Requires local QA admin fixture; NEVER run against production."""
import json,urllib.request,urllib.error
BASE='http://terminal.local:4173'
def call(user=None,body=None,path='/api/portal'):
 h={}
 if user:h.update({'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'})
 if body:h.update({'Content-Type':'application/json','Origin':BASE})
 r=urllib.request.Request(BASE+path,headers=h,data=json.dumps(body).encode() if body else None)
 try:
  with urllib.request.urlopen(r) as resp:return resp.status,json.load(resp)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
assert call(path='/api/portal?media=emosi')[0]==200
assert call(path='/api/portal?media=tts')[0]==403
code,d=call('qa-user');assert code==200 and d['user']['role']=='user'
assert call('qa-user',path='/api/portal?media=tts')[0]==403
assert call('qa-user',{'action':'settings','price':1})[0]==403
assert call('qa-user',{'action':'setup','key':'wrong'})[0]==403
assert call('qa-admin',{'action':'settings','price':25000,'bank':'BANK UJI','account':'000000','holder':'DATA UJI'})[0]==200
assert call('qa-user',{'action':'payment','sender':'Guru QA','reference':'REFERENSI UJI'})[0]==200
assert call('qa-user',{'action':'payment','sender':'Guru QA','reference':'REFERENSI UJI'})[0]==409
_,d=call('qa-admin');pid=next(p['id'] for p in d['payments'] if p['user_id']=='qa-user' and p['status']=='pending')
assert call('qa-user',{'action':'approve','id':pid})[0]==403
assert call('qa-admin',{'action':'approve','id':pid})[0]==200
assert call('qa-admin',{'action':'approve','id':pid})[0]==409
assert call('qa-user',path='/api/portal?media=tts')[0]==200
for media in ['labirin','detektif','lampu','tts','jadwal','profesi','dilema']:
 status,g=call('qa-admin',path='/api/portal?media='+media);assert status==200
 if g['type']=='branch':
  for node in g['nodes']:
   for target in node.get('next',[]):assert 0<=target<len(g['nodes'])
 if g['type']=='crossword':
  grid={}
  for w in g['words']:
   for i,char in enumerate(w['word']):
    cell=(w['row']+(i if w['dir']=='down' else 0),w['col']+(i if w['dir']=='across' else 0))
    assert cell not in grid or grid[cell]==char,(cell,char,grid.get(cell))
    assert 0<=cell[0]<8 and 0<=cell[1]<7
    grid[cell]=char
assert call('qa-admin',{'action':'block','id':'qa-user','blocked':True})[0]==200
assert call('qa-user',path='/api/portal?media=tts')[0]==403
assert call('qa-admin',{'action':'block','id':'qa-user','blocked':False})[0]==200
print('PASS: anonymous demo, premium gating, role checks, payment/duplicate prevention, approval, unblock, all 8 media and crossword consistency')
