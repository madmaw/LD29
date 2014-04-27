module GB.State.Play.Mind {

    export class CreeperMind extends DummyMind {

        thinkFreely(monster:Monster, level:Level, ticks: number): boolean {
            var result;
            if( level.getToneSequencer().isPlaying(monster.getType(), monster) ) {
                result = super.thinkFreely(monster, level, ticks);
            } else {
                result = true;
            }
            return result;
        }

    }

}