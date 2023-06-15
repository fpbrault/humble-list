export const getUserSettings = () => {
    const settings = localStorage.getItem('userSettings');
    console.log(settings);
    return settings ? JSON.parse(settings) : null;
};

export const saveUserSettings = (settings: any) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
};