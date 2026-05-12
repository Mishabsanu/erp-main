export const triggerAttendanceUpdate = () => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('attendance-updated');
        window.dispatchEvent(event);
    }
};
