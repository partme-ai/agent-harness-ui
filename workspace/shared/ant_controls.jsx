// Preserve imported ZCode/Buddy event contracts while rendering actual Ant Design controls.
import React from 'react';
import {Button,Input,Select,Switch,Checkbox,Slider} from 'antd';
export function AntNativeButton({type='button',role,children,className='',...props}) {
 if(role==='switch'){const safeClass=className.split(/\s+/).filter(name=>!['zs-switch','zc-switch','on'].includes(name)).join(' ');return <Switch {...props} className={'baseline-switch '+safeClass} checked={!!props['aria-checked']} />;}
 return <Button autoInsertSpace={false} {...props} role={role} htmlType={type} className={className}>{children}</Button>;
}
export function AntNativeInput({type='text',size,children,...props}) {
 if(type==='checkbox')return <Checkbox {...props}>{children}</Checkbox>;
 if(type==='range'){const {onChange,value,min,max,step,...rest}=props;return <Slider {...rest} value={Number(value)} min={Number(min)} max={Number(max)} step={step?Number(step):1} onChange={value=>onChange?.({target:{value:String(value)}})}/>;}
 if(type==='file')return <input {...props} type={type}/>;
 const Component=type==='password'?Input.Password:Input;
 return <Component {...props} type={type==='password'?undefined:type} htmlSize={size} />;
}
export function AntNativeTextarea({children,...props}) {return <Input.TextArea {...props}>{children}</Input.TextArea>;}
function optionsFrom(children){return React.Children.toArray(children).flatMap(child=>{
 if(!React.isValidElement(child))return [];
 if(child.type==='option')return [{value:child.props.value,label:child.props.children,disabled:child.props.disabled}];
 if(child.type==='optgroup')return [{label:child.props.label,options:optionsFrom(child.props.children)}];
 return optionsFrom(child.props.children);
});}
export function AntNativeSelect({children,onChange,onKeyDown,...props}) {
 return <Select {...props} options={optionsFrom(children)} onKeyDown={onKeyDown} onChange={value=>onChange?.({target:{value},currentTarget:{value}})} />;
}
