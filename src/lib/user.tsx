export const getUserSettings = () => {
    const settings = localStorage.getItem('userSettings');
    return settings ? JSON.parse(settings) : { themeName: 'coffee', viewMode: "detailed" };
};

export const saveUserSettings = (settings: any) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
};