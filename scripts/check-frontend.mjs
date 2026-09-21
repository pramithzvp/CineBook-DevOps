// Focused checks for booking rules and browser-state restoration.
import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../lib/cinebook.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const tests=[];
function check(name,fn){fn();tests.push(name);}
check('Filter preserves each film’s original hall',()=>assert.equal(app.filterMovies('batman','all','all','featured')[0].hall,3));
check('Genre and format filters combine',()=>assert.deepEqual(app.filterMovies('','Sci-fi','2D','featured').map(m=>m.id),['interstellar']));
check('Price sorting is ascending',()=>assert.deepEqual(app.filterMovies('','all','all','price').map(m=>m.price),[1500,1800,2200]));
check('Adjacent seats never cross the aisle',()=>{for(let n=1;n<=4;n++){const seats=app.suggestSeats([],n);assert.equal(seats.length,n);const nums=seats.map(s=>Number(s.slice(1)));assert.ok(nums.every(x=>x<=4)||nums.every(x=>x>=5));}});
check('A full hall returns no suggestion',()=>assert.deepEqual(app.suggestSeats('ABCDEFGH'.split('').flatMap(r=>Array.from({length:8},(_,i)=>r+(i+1))),2),[]));
check('Sri Lanka showtime cutoff',()=>{const now=Date.parse('2026-09-22T13:30:00Z');assert.equal(app.showStarted('2026-09-22','19:00',now),true);assert.equal(app.showStarted('2026-09-22','19:01',now),false);});
const booking={id:'CB-TEST',movieId:'dune',date:'2026-09-22',time:'19:00',cinema:'colombo',seats:['A1','A2'],name:'Test Guest',total:4600,mode:'demo',createdAt:new Date().toISOString(),owner:'guest'};
check('Cancelled reservations release their seats',()=>{assert.ok(app.occupiedSeats([booking],booking).includes('A1'));assert.ok(!app.occupiedSeats([{...booking,cancelled:true}],booking).includes('A1'));});
check('Bookings cannot occupy another cinema',()=>assert.ok(!app.occupiedSeats([booking],{...booking,cinema:'kandy'}).includes('A1')));
check('Malformed stored data is discarded',()=>{assert.deepEqual(app.restoreBookings('not json'),[]);assert.deepEqual(app.restoreBookings('[{"id":"x"}]'),[]);assert.equal(app.restoreBookings(JSON.stringify([booking])).length,1);});
check('Test password requirements',()=>{assert.deepEqual(app.passwordChecks('CineBook123!'),[true,true,true]);assert.ok(!app.passwordChecks('short').every(Boolean));assert.ok(app.validEmail('demo@example.com'));assert.ok(!app.validEmail('invalid'));});
check('Cancelled ticket is explicitly marked',()=>assert.match(app.ticketText({...booking,cancelled:true}),/CANCELLED — NOT VALID/));
console.log(`${tests.length} focused frontend checks passed.\n`+tests.map(t=>'✓ '+t).join('\n'));
