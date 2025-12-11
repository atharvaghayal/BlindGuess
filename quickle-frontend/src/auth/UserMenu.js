import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const UserMenu = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <div className="user-menu-wrapper" ref={menuRef}>
            <div className="user-avatar" onClick={() => setOpen((prev) => !prev)}>
                {initial}
            </div>
            {open && (
                <div className="user-menu">
                    <div className="user-menu__header">
                        <div className="user-menu__name">{user.email}</div>
                        <div className="user-menu__provider">Signed in via {user.provider}</div>
                    </div>
                    <button className="user-menu__item">Profile</button>
                    <button className="user-menu__item" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;

