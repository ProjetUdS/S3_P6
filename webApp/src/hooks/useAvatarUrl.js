import { useState, useEffect } from 'react';
import { getAvatarUrl } from '../services/settingsApi';

const avatarCache = new Map();
const inflightRequests = new Map();

export function useAvatarUrl(cip) {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAvatar = () => {
        if (!cip) {
            setAvatarUrl(null);
            return;
        }

        if (avatarCache.has(cip)) {
            setAvatarUrl(avatarCache.get(cip));
            return;
        }

        if (inflightRequests.has(cip)) {
            inflightRequests.get(cip).then(setAvatarUrl);
            return;
        }

        setLoading(true);
        const promise = getAvatarUrl(cip)
            .then((url) => {
                avatarCache.set(cip, url);
                setAvatarUrl(url);
                return url;
            })
            .catch(() => {
                avatarCache.set(cip, null);
                setAvatarUrl(null);
                return null;
            })
            .finally(() => {
                inflightRequests.delete(cip);
                setLoading(false);
            });

        inflightRequests.set(cip, promise);
    };

    useEffect(() => {
        fetchAvatar();
    }, [cip]);

    // Listen for avatar-updated event to invalidate cache and re-fetch
    useEffect(() => {
        if (!cip) return;
        
        const handleAvatarUpdated = () => {
            avatarCache.delete(cip);
            inflightRequests.delete(cip);
            fetchAvatar();
        };

        window.addEventListener('avatar-updated', handleAvatarUpdated);
        return () => window.removeEventListener('avatar-updated', handleAvatarUpdated);
    }, [cip]);

    return { avatarUrl, loading };
}

export function invalidateAvatarCache(cip) {
    if (cip) {
        avatarCache.delete(cip);
        inflightRequests.delete(cip);
    } else {
        avatarCache.clear();
        inflightRequests.clear();
    }
}