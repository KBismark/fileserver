
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './header.css'
import { updateStore } from 'statestorejs';
import { type CardProps } from './filecard';

export type SiteData = {email: string; content: CardProps[], search: string };
export const serverUrl = window.location.origin;
const screenWidth = window.innerWidth;
type Props = {email: string}
export const Header = ({email}: Props)=>{
    const [loggingOut, setLog] = useState(false);
    const [searchOn, setSearchStatus] = useState(false);
    const [timing, setTiming] = useState<any>(undefined);
    const [resizeTiming, setResizeTiming] = useState<any>(undefined);
    const [smallScreen, setScreen] = useState(screenWidth<600);
    const ref_1 = useRef<HTMLInputElement>(null);
    useEffect(()=>{
        return ()=>{
            clearTimeout(timing)
        }
    },[]);
    useEffect(()=>{
        if(searchOn){
            ref_1.current?.focus()
        }
    },[searchOn]);

    useLayoutEffect(()=>{
        const handler = ()=>{
            clearTimeout(resizeTiming);
            const width = window.innerWidth;
            const t = setTimeout(() => {
                setScreen(width<600)
            }, 500);
            setResizeTiming(t);
        };
        window.addEventListener('resize',handler,false);
        return ()=>{
            clearTimeout(resizeTiming);
            window.removeEventListener('resize',handler,false);
        }
    },[])

    const onLogout = ()=>{
        if(loggingOut) return;
        setLog(true);

        fetch(`${serverUrl}/auth/sign_out`,{
            method: 'PATCH',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response)=>{
            if(response.ok){
                window.location.replace(`${window.location.origin}/`);
                return;
            }
            alert('Please check your internet connection.')
            setLog(false);
        })
        .catch((err)=>{
            alert('Please check your internet connection.')
            setLog(false);
        })
    }

    const onSearch = (e: React.KeyboardEvent<HTMLInputElement>)=>{
        const value = ((e.target as any).value||'').trim();
        if(value.length>100){
            return;
        }
        if(value.length<1){
            setSearchStatus(false)
        }
        clearTimeout(timing);
        const t = setTimeout(() => {
            updateStore<SiteData>('datastore', 'site', {
                store: {search: value.toLowerCase()},
                actors: ['search']
            })
        }, 1000);
        setTiming(t);
    }

    const onBlur = (e:any)=>{
        if(e.target.value.length<1){
            onSearch(e);
        }
    };

    email = (email.length>20? `${email.slice(0,smallScreen?16:30)}...`: email).toLowerCase();
    
    return (
        <header className="header">
            { (!searchOn||!smallScreen)&&<div style={{fontWeight: 500,}}>Hi, {email}</div> }
            {
                (searchOn||!smallScreen)&&
                <label>
                    <input ref={ref_1} onKeyUp={onSearch} onChange={onBlur} onBlur={onBlur} name="r" type="search" maxLength={100} placeholder="Search for files" />
                </label>
                
            }
            <div className='flex-center'>
                <div>
                    {
                        (!searchOn&&smallScreen)&&
                        <div tabIndex={0} role='button' className='search-button flex-center' onClick={()=>{
                            setSearchStatus(true)
                        }} >
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="18"  height="18"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v4.5" /><path d="M16.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /><path d="M18.5 19.5l2.5 2.5" /></svg>
                        </div>
                    }
                </div>
                <button onClick={onLogout}>Logout</button>
            </div>
        </header>
    )
    
}
