import contextlib, json, os, subprocess, time, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('MP_V11_QA_OUT',str(ROOT/'qa'/'screenshots'))); OUT.mkdir(parents=True,exist_ok=True)
P='11111111-1111-4111-8111-111111111111'; T='22222222-2222-4222-8222-222222222222'; C='33333333-3333-4333-8333-333333333333'; S='44444444-4444-4444-8444-444444444444'; D='55555555-5555-4555-8555-555555555555'

member_buyer={'db_role':'buyer','status':'active','tenant_id':T,'client_id':C,'client_store_id':S,'store_name':'Paris','client_name':'Atelier Paris'}
member_private={'db_role':'private_client','status':'active','tenant_id':T,'client_id':P,'client_store_id':None,'client_name':'Private Maison'}
identity={'user_id':P,'admin':True,'memberships':[member_buyer,member_private]}
def client_order(store):
 return {'id':D,'code':'MP-2026-041','store_id':store,'stage':'shipped','currency':'EUR','current_revision':3,'total_amount':'2450.00','lines':[{'quantity':10,'unit_price':'245.00','line_total':'2450.00'}], 'payments':[{'currency':'EUR','amount':'800.00','status':'verified'},{'currency':'EUR','amount':'1200.00','status':'submitted'}]}
def client_snapshot(role):
 store=S if role=='buyer' else None; return {'mode':'SERVER','client_id':C if role=='buyer' else P,'store_scope':store,'orders':[client_order(store)]}
def delivery(role):
 return {'mode':'SERVER','access_role':role,'requested_store':S if role=='buyer' else None,'orders':[{'id':D,'code':'MP-2026-041','client_id':C if role=='buyer' else P,'store_id':S if role=='buyer' else None,'stage':'shipped','currency':'EUR','ordered_units':10,'delivered_units':4,'undelivered_units':6,'undocumented_units':0,'shipments':[{'id':S,'receipt':{'id':D},'status':'delivered'},{'id':T,'status':'in_transit'}]}]}
def dispatch(route):
 req=route.request
 if req.method=='OPTIONS': route.fulfill(status=204, headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type,cache-control','Access-Control-Allow-Methods':'POST,OPTIONS'});return
 path=req.url.split('/rest/v1/rpc/')[-1] if '/rest/v1/rpc/' in req.url else ''
 args=req.post_data_json if req.post_data else {}
 if '/auth/v1/token' in req.url: val={'user':{'id':P},'access_token':'test-fixture-access-token','refresh_token':'test-fixture-refresh-token','expires_in':3600}
 elif path=='mp_my_access': val=identity
 elif path=='mp_client_snapshot': val=client_snapshot(args.get('p_access_role'))
 elif path=='mp_client_delivery_ledger': val=delivery(args.get('p_access_role'))
 elif path=='mp_client_issued_proformas': val=[{'number':'PI-2026-041','deal_id':D,'amount':'2450.00','currency':'EUR','status':'issued'}]
 elif path=='mp_admin_snapshot': val={'mode':'SERVER','tenant_id':T,'orders':[{'id':D,'code':'MP-2026-041','client_name':'Atelier Paris','store_name':'Paris','stage':'shipped','total_amount':'2450.00','currency':'EUR','current_revision':3,'shipments':[{'status':'in_transit'}]}],'products':[{'publication_status':'published','retail_price':None}],'approvals':[{'status':'pending'}]}
 elif path=='mp_admin_money_evidence': val={'authority':'postgresql','by_currency':[{'currency':'EUR','booked_gmv':'2450.00','approved_order_value':'2450.00','verified_settlement':'800.00','unverified_payment_evidence':'1200.00','issued_proforma_open_balance':'1650.00','delivered_goods_value':'980.00','delivered_contribution_estimate':'340.00','delivered_units':4,'delivered_units_missing_cogs':0},{'currency':'USD','booked_gmv':'840.00','approved_order_value':'840.00','verified_settlement':'200.00','unverified_payment_evidence':'0.00','issued_proforma_open_balance':'640.00','delivered_goods_value':'0.00','delivered_contribution_estimate':None,'delivered_units':0,'delivered_units_missing_cogs':0}]}
 elif path=='mp_admin_fulfillment_queue': val={'mode':'SERVER','payments':[{'status':'submitted'}],'proformas':[],'shipments':[{'id':S,'code':'SH-001','deal_code':'MP-2026-041','status':'in_transit','carrier':'DHL','tracking':'TRACK-2026'}]}
 elif '/auth/v1/logout' in req.url: val={}
 else: raise Exception('Unknown mock endpoint:'+req.url)
 route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type,cache-control','Access-Control-Allow-Methods':'POST,OPTIONS'},body=json.dumps(val))

def label_fixture(page, floating=False):
 page.evaluate("""isVideo => {const tag=document.createElement('div');tag.textContent='UI QA / SYNTHETIC FIXTURES — NOT LIVE BUSINESS DATA';Object.assign(tag.style,{position:isVideo?'fixed':'relative',zIndex:'99999',left:'0',right:'0',top:isVideo?'0':'auto',display:'block',textAlign:'center',font:'bold 11px Arial',letterSpacing:'2px',background:'#763a3d',color:'white',padding:'12px',marginTop:isVideo?'0':'20px',pointerEvents:'none'});document.body.appendChild(tag)}""",floating)

http=subprocess.Popen(['python3','-m','http.server','8866','--bind','127.0.0.1'],cwd=str(ROOT),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 time.sleep(1)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  try:
   for w,h in [(1440,900),(768,1024),(375,812)]:
    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    errors=[];page.on('pageerror', lambda x: errors.append(str(x)))
    page.goto('http://127.0.0.1:8866/commercial-os.html',wait_until='networkidle');
    assert page.locator('#login-submit').is_disabled(), 'No config must block login'
    assert 'not yet configured' in page.locator('#config-status').inner_text()
    assert page.locator('[data-role]').count()==0
    page.screenshot(path=str(OUT/f'locked_{w}.png'),full_page=True)
    assert not errors, f'Page errors {errors}'
    page.close()
   for role,w,h in [('admin',1440,900),('wholesale',768,1024),('private',375,812)]:
    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda x: errors.append(str(x)))
    qa_console=[];qa_requests=[];qa_failures=[]
    page.add_init_script("window.MP_COMMERCE_QA = true;")
    page.on('console',lambda x: qa_console.append(x.text[:260]) if x.type in ('error','warning') or x.text.startswith('QA_') else None)
    page.on('request',lambda x: qa_requests.append(x.method+' '+x.url.split('/rest/v1/rpc/')[-1].split('/auth/v1/')[0][:90]) if 'marcoqa.supabase.co' in x.url else None)
    page.on('requestfailed',lambda x: qa_failures.append(x.url[:115]+' '+str(x.failure)))
    page.route('**/client/runtime-config.js',lambda route: route.fulfill(status=200,content_type='application/javascript',body="window.MP_COMMERCE_CONFIG={url:'https://marcoqa.supabase.co',publishableKey:'sb_publishable_qa_only'};"))
    page.route('**/marcoqa.supabase.co/**',dispatch)
    page.goto('http://127.0.0.1:8866/commercial-os.html',wait_until='networkidle')
    assert page.locator('#login-submit').is_enabled()
    page.locator('#email').fill('qa@example.com');page.locator('#password').fill('synthetic-password')
    page.locator('#login-submit').click()
    try:
      page.locator('#content').wait_for(state='visible',timeout=10000)
    except Exception:
      note=page.locator('#notice')
      print('BROWSER_LOGIN_DEBUG',json.dumps({
        'role':role,
        'notice':note.inner_text() if note.count() else None,
        'config':page.locator('#config-status').inner_text(),
        'page_errors':errors,
        'is_signed_out':page.locator('#gate').is_visible(),
        'role_buttons':page.locator('#role-options button').count(),
        'qa_console':qa_console[-12:],
        'qa_requests':qa_requests[-15:],
        'qa_failures':qa_failures[-10:]
      }),flush=True)
      page.screenshot(path=str(OUT/f'debug_login_{role}_{w}.png'),full_page=True)
      raise
    page.locator(f'button[data-role="{role}"]').click()
    page.locator('#results .workspace-head h2').wait_for(timeout=10000)
    assert page.locator('#results .workspace-head h2').inner_text().strip()=='Overview'
    assert 'PostgreSQL authority' in page.locator('#results').inner_text()
    label_fixture(page)
    page.screenshot(path=str(OUT/f'preview_{role}_{w}.png'),full_page=True)
    if role=='wholesale':
      page.locator('button[data-panel="planning"]').click()
      page.locator('#scenario button[type="submit"]').click()
      assert '12' in page.locator('#scenario-output').inner_text(), page.locator('#scenario-output').inner_text()
      page.screenshot(path=str(OUT/'preview_wholesale_reorder_768.png'),full_page=True)
    assert not errors, f'{role} JS errors {errors}'
    page.close()
   # Real Chromium screen recording of the STAGED application, using mock RPC evidence only.
   # Never label this as a production walkthrough or a live-authorized user session.
   video_ctx=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1,
                                 record_video_dir=str(OUT/'recordings'),record_video_size={'width':1440,'height':900})
   movie=video_ctx.new_page()
   movie.route('**/client/runtime-config.js',lambda route: route.fulfill(status=200,content_type='application/javascript',body="window.MP_COMMERCE_CONFIG={url:'https://marcoqa.supabase.co',publishableKey:'sb_publishable_qa_only'};"))
   movie.route('**/marcoqa.supabase.co/**',dispatch)
   movie.goto('http://127.0.0.1:8866/commercial-os.html',wait_until='networkidle')
   label_fixture(movie,True)
   movie.wait_for_timeout(1800)
   movie.locator('#email').fill('qa@example.com')
   movie.locator('#password').fill('synthetic-password')
   movie.locator('#login-submit').click()
   movie.locator('#content').wait_for(state='visible',timeout=10000)
   movie.wait_for_timeout(3600)
   movie.locator('button[data-panel="finance"]').click();movie.wait_for_timeout(3000)
   movie.locator('button[data-role="wholesale"]').click();movie.wait_for_function("document.querySelector('#scope')?.textContent?.includes('Atelier Paris / Paris')",timeout=10000);movie.wait_for_timeout(3400)
   movie.locator('button[data-panel="planning"]').click()
   movie.locator('#scenario button[type="submit"]').click()
   assert '12' in movie.locator('#scenario-output').inner_text()
   movie.wait_for_timeout(4100)
   movie.locator('button[data-role="private"]').click();movie.wait_for_function("document.querySelector('#scope')?.textContent?.includes('Private Maison')",timeout=10000);movie.wait_for_timeout(3200)
   movie.locator('button[data-panel="fulfillment"]').click();movie.wait_for_timeout(3200)
   movie.locator('button[data-role="admin"]').click();movie.wait_for_function("document.querySelector('#scope')?.textContent?.includes('Brand administration')",timeout=10000);movie.wait_for_timeout(2000)
   recording=movie.video
   movie.close();video_ctx.close()
   source_movie=Path(recording.path())
   assert source_movie.is_file() and source_movie.stat().st_size>30000, 'Missing Chromium recording'
   webm=OUT/'marco-v31-11-SYNTHETIC-qa-tour.webm'
   shutil.copyfile(source_movie,webm)
   if shutil.which('ffmpeg'):
    mp4=OUT/'marco-v31-11-SYNTHETIC-qa-tour-25s.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(webm),'-t','28','-an','-c:v','libx264','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',str(mp4)],check=True)
    assert mp4.stat().st_size>50000, 'MP4 below quality threshold'
    if shutil.which('ffprobe'):
     sec=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(mp4)],text=True).strip())
     assert 20<=sec<=30, f'Video duration must be 20-30 seconds: {sec}'
     print(f'SYNTHETIC_BROWSER_VIDEO_PASS: mp4_duration={sec:.2f}s',flush=True)
   else:
    print('SYNTHETIC_BROWSER_VIDEO_WEBM_ONLY: ffmpeg unavailable',flush=True)
   print('BROWSER_QA_PASS: 3 locked sizes + Admin/Wholesale/Private synthetic authority + reorder + synthetic walkthrough',flush=True)
  finally:browser.close()
finally: http.terminate();http.wait()
