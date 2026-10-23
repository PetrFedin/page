import test from 'node:test';
import assert from 'node:assert/strict';
import {CommerceError, minor, decimal, qty, percentBp, formatAmount, verifyClientScope,
  analyzeClientOrder, projectAdmin, planReorder, sellThrough, gmroi} from '../core/commerce-engine.mjs';

const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',
  C='33333333-3333-4333-8333-333333333333',D='44444444-4444-4444-8444-444444444444';
const member={tenant_id:A,client_id:B,client_store_id:C,db_role:'buyer'};
const order={id:D,code:'MP-100',store_id:C,currency:'EUR',stage:'shipped',total_amount:'199.98',current_revision:2,
  lines:[{quantity:2,unit_price:'99.99',line_total:'199.98'}],
  payments:[{status:'submitted',amount:'50.00',currency:'EUR'},{status:'verified',amount:'30.00',currency:'EUR'}]};
const snap={mode:'SERVER',client_id:B,store_scope:C,orders:[order]};
const ledger={mode:'SERVER',access_role:'buyer',requested_store:C,orders:[{id:D,client_id:B,store_id:C,currency:'EUR',delivered_units:1,undelivered_units:1,ordered_units:2,undocumented_units:0}]};
const throwsCode=(fn,code)=>assert.throws(fn,e=>e instanceof CommerceError&&e.code===code);
test('money exact cents and BigInt',()=>{assert.equal(minor('0.01'),1n);assert.equal(minor('0.99')+minor('0.01'),100n);assert.equal(decimal(minor('-1234567890.05')),'-1234567890.05');assert.equal(minor('23'),2300n);});
for(const input of ['NaN','Infinity','1.005','1e5',null,undefined,'',' 12','1,2']) test('reject invalid money '+String(input),()=>throwsCode(()=>minor(input),'INVALID_MONEY'));
test('money with high precision is never silently rounded',()=>{assert.equal(decimal(minor('100000000000000000000.01')),'100000000000000000000.01')});
for(const input of [-1,0.5,'1.2','Infinity',null,NaN,Number.MAX_SAFE_INTEGER+1]) test('invalid qty '+String(input),()=>throwsCode(()=>qty(input),'INVALID_QUANTITY'));
test('percent denominator zero is unknown',()=>assert.equal(percentBp(2,0),null));
test('percent denominator works in bp',()=>assert.equal(percentBp(3,8),3750));
test('USD formatting is localized',()=>assert.match(formatAmount(minor('110.20'),'USD','en'),/110\.20/));
test('scope accepts exact Paris store with POD',()=>assert.equal(verifyClientScope(snap,ledger,member).orders.length,1));
test('scope rejects other store snapshot',()=>throwsCode(()=>verifyClientScope({...snap,store_scope:D},ledger,member),'CROSS_STORE_SNAPSHOT'));
test('scope rejects other store order',()=>throwsCode(()=>verifyClientScope({...snap,orders:[{...order,store_id:D}]},ledger,member),'CROSS_STORE_ORDER'));
test('scope rejects null membership store',()=>throwsCode(()=>verifyClientScope(snap,ledger,{...member,client_store_id:null}),'BUYER_STORE_UNASSIGNED'));
test('scope rejects other client',()=>throwsCode(()=>verifyClientScope({...snap,client_id:C},ledger,member),'CROSS_CLIENT_SNAPSHOT'));
test('scope rejects foreign client delivery',()=>throwsCode(()=>verifyClientScope(snap,{...ledger,orders:[{...ledger.orders[0],client_id:C}]},member),'CROSS_CLIENT_DELIVERY'));
test('scope rejects other store delivery',()=>throwsCode(()=>verifyClientScope(snap,{...ledger,orders:[{...ledger.orders[0],store_id:D}]},member),'CROSS_STORE_DELIVERY'));
test('scope rejects wrong delivery-query store',()=>throwsCode(()=>verifyClientScope(snap,{...ledger,requested_store:D},member),'CROSS_STORE_DELIVERY_QUERY'));
test('scope rejects duplicate orders',()=>throwsCode(()=>verifyClientScope({...snap,orders:[order,order]},ledger,member),'DUPLICATE_ORDER'));
test('scope rejects malformed server mode',()=>throwsCode(()=>verifyClientScope({...snap,mode:'DEMO'},ledger,member),'UNVERIFIED_SERVER_SNAPSHOT'));
test('issued proformas must have matching currency',()=>throwsCode(()=>verifyClientScope(snap,ledger,member,[{deal_id:D,currency:'USD'}]),'CROSS_CURRENCY_PROFORMA'));
test('proformas for other order are excluded',()=>assert.equal(verifyClientScope(snap,ledger,member,[{deal_id:A,currency:'EUR'}]).proformas.length,0));
test('private client scope does not require store',()=>{const p={...member,db_role:'private_client',client_store_id:null};assert.equal(verifyClientScope({...snap,store_scope:null},null,p).orders.length,1)});
test('private store scope blocked',()=>throwsCode(()=>verifyClientScope(snap,null,{...member,db_role:'private_client',client_store_id:null}),'PRIVATE_STORE_SCOPE_UNEXPECTED'));
test('order preserves verified vs submitted evidence',()=>{const x=analyzeClientOrder(order,ledger.orders[0]);assert.equal(x.authoritativeTotal,19998n);assert.equal(x.verifiedEvidence,3000n);assert.equal(x.pendingEvidence,5000n);assert.equal(x.deliveredUnits,1);assert.equal(x.deliveryRatioBp,5000)});
test('order without POD ledger is unknown, not zero delivery',()=>{const x=analyzeClientOrder(order);assert.equal(x.deliveredUnits,null);assert.equal(x.awaitingUnits,null);assert.equal(x.deliveryRatioBp,null)});
test('client order rejects other delivery identity',()=>throwsCode(()=>analyzeClientOrder(order,{...ledger.orders[0],id:A}),'DELIVERY_ORDER_MISMATCH'));
test('client order flags over-delivery',()=>assert.ok(analyzeClientOrder(order,{...ledger.orders[0],delivered_units:3,undelivered_units:0}).warnings.includes('OVER_DELIVERED')));
test('client order flags undocumented delivery',()=>assert.ok(analyzeClientOrder(order,{...ledger.orders[0],undocumented_units:1}).warnings.includes('DELIVERY_WITHOUT_POD')));
test('client order flags price snapshot delta',()=>assert.ok(analyzeClientOrder({...order,lines:[{quantity:2,unit_price:'90',line_total:'199.98'}]}).warnings.includes('PRICE_SNAPSHOT_DELTA')));
test('admin currencies never summed together',()=>{const a=projectAdmin({mode:'SERVER',tenant_id:A,orders:[],products:[],approvals:[]},{authority:'postgresql',by_currency:[{currency:'EUR',booked_gmv:'200.00'},{currency:'USD',booked_gmv:'150.00'}]},{mode:'SERVER',payments:[],shipments:[]});assert.equal(a.currencies.size,2);assert.equal(a.currencies.get('EUR').booked_gmv,20000n);assert.equal(a.currencies.get('USD').booked_gmv,15000n);assert.equal(a.recognizedRevenue,null);});
test('admin rejects unsigned finance authority',()=>throwsCode(()=>projectAdmin({mode:'SERVER',tenant_id:A},{authority:'client'}, {mode:'SERVER'}),'UNVERIFIED_FINANCE_AUTHORITY'));
test('admin null cogs disables contribution',()=>{const a=projectAdmin({mode:'SERVER',tenant_id:A,products:[]},{authority:'postgresql',by_currency:[{currency:'EUR',delivered_units:5,delivered_units_missing_cogs:1,delivered_contribution_estimate:'400.00'}]},{mode:'SERVER'});assert.equal(a.currencies.get('EUR').contribution,null);assert.ok(a.warnings.includes('EUR:MISSING_DELIVERED_COGS'))});
test('admin warns about published without retail price',()=>{const a=projectAdmin({mode:'SERVER',tenant_id:A,products:[{publication_status:'published',retail_price:null}]},{authority:'postgresql'},{mode:'SERVER'});assert.equal(a.productsMissingRetailPrice,1)});
test('reorder scenario WMA uses 1:2:3:4 weights',()=>{const r=planReorder({sales:[3,4,5,6],onHand:8,inbound:2,leadWeeks:3,safetyWeeks:1,moq:6,multiple:3});assert.equal(r.weightedWeeklyUnits,5);assert.equal(r.targetStockUnits,20);assert.equal(r.suggestedUnits,12);assert.equal(r.isForecast,false)});
test('reorder enforces MOQ rounded to order multiple',()=>assert.equal(planReorder({sales:[1,1,1,1],onHand:0,leadWeeks:1,safetyWeeks:0,moq:8,multiple:6}).suggestedUnits,12));
test('reorder with no demand returns zero without divide by zero',()=>{const r=planReorder({sales:[0,0,0,0],onHand:10,leadWeeks:1});assert.equal(r.suggestedUnits,0);assert.equal(r.estimatedWeeksCover,null)});
for (const data of [{sales:[2,4,6],onHand:0,leadWeeks:2},{sales:[1,2,3,4],onHand:-1,leadWeeks:2},{sales:[1,2,3,4],onHand:0,leadWeeks:0},{sales:[1,2,3,4],onHand:0,leadWeeks:2,multiple:0}]) test('bad reorder plan is rejected '+JSON.stringify(data),()=>assert.throws(()=>planReorder(data),CommerceError));
test('sell-through 0 base unknown',()=>assert.equal(sellThrough(0,0).basisPoints,null));
test('sell-through return 5/10 is 50%',()=>assert.equal(sellThrough(5,10).basisPoints,5000));
test('sell-through cannot exceed stock',()=>assert.equal(sellThrough(12,10).warning,'SOLD_EXCEEDS_AVAILABLE'));
test('GMROI is basis points and null with no stock',()=>{assert.equal(gmroi('80','200'),4000);assert.equal(gmroi('1','0'),null)});
