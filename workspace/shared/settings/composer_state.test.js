import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availableComposerModels,permissionOptions,shouldSubmitOnEnter} from '../composer_state.js';
test('composer permissions exclude the independent plan flag',()=>assert.deepEqual(permissionOptions.map(p=>p.value),['confirm','auto','full']));
test('model picker respects enabled models and provider identity',()=>{
 const models=availableComposerModels([{id:'a',name:'A',models:['m','off'],enabledModels:{off:false}},{id:'b',name:'B',models:['m']}]);
 assert.equal(models.length,2);assert.notEqual(models[0].key,models[1].key);
});
test('Enter submits but Shift+Enter and IME confirmation do not',()=>{
 assert.equal(shouldSubmitOnEnter({key:'Enter'}),true);
 for(const event of [{key:'Enter',shiftKey:true},{key:'Enter',isComposing:true},{key:'Enter',keyCode:229},{key:'a'}])assert.equal(shouldSubmitOnEnter(event),false);
});
