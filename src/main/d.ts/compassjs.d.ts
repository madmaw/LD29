interface ICompass {
    noSupport(cb:()=>void): ICompass;

    needGPS(cb:()=>void): ICompass;

    needMove(cb:()=>void): ICompass;

    init(cb:(enabled:boolean)=>void): ICompass;

    watch(cb:(headingDegrees:number)=>void): number;

    unwatch(watchId:number): void;
}

declare var Compass: ICompass;