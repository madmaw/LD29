module GB.State.Play.Spawner {
    export class RandomSpawnerWeight {

        constructor(
            public weight: number,
            public coolDownValue: number,
            public maxQuantityMultiplier: number,
            public type: number,
            public subtype: number,
            public mindFactory: IMindFactory,
            public toneFactory: IToneFactory
        ) {

        }

    }
}