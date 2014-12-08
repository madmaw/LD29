window.onload = () => {

    // shim
    if( !window.requestAnimationFrame ) {
        window.requestAnimationFrame =
                window["webkitRequestAnimationFrame"] ||
                window["mozRequestAnimationFrame"] ||
                function( callback ) {
                    return window.setTimeout(callback, 1000 / 60);
                };
    }
    if( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame =
            window["webkitCancelAnimationFrame"] ||
            window["mozCancelAnimationFrame"] ||
            function( handle:number ) {
                return window.clearTimeout(handle);
            };
    }

    var audioContext: AudioContext;
    if( window["AudioContext"] ) {
        audioContext = new AudioContext();
    } else if( window["webkitAudioContext"] ) {
        audioContext = new webkitAudioContext();
    }
    if( !audioContext.createGainNode ) {
        audioContext.createGainNode = audioContext.createGain;
    }

    var domParser = new DOMParser();
    var toXMLTransformer = (t:any) => {
        var xml = GB.Util.toXML(t);
        var result;
        if( xml != null ) {
            result = domParser.parseFromString(xml, "text/xml");
        } else {
            result = null;
        }
        return result;
    };
    var xslTransformerFactory = new GB.Transformer.XSL.StandardXSLTransformerFactory(domParser, document, toXMLTransformer);

    var playTemplate = document.getElementById("play-template").innerHTML;
    var playTransformer = GB.Transformer.createTransformerFactoryFromString(xslTransformerFactory, playTemplate)();

    var beatDuration = 1000;

    var explosionToneDuration = beatDuration;
    var explosionToneFactory = function() {
        //var attackTime = Math.random() * 1;
        var attackTime = explosionToneDuration / (1000 * 8);
        //var decayTime = Math.random() * bulletToneDuration / 1000;
        var decayTime = explosionToneDuration / 1000;
        //var releaseTime = Math.random() * 1;
        var releaseTime = explosionToneDuration / 1000;

        var oscillator = audioContext.createOscillator();
        oscillator.frequency.value = 100;


        var staticNode = audioContext.createScriptProcessor(1024, 1, 1);
        // iOS needs an input in order for this to work :(
        staticNode.onaudioprocess = function(ev:any) {
            var out = ev.outputBuffer.getChannelData(0);
            for (var i = 0; i < out.length; i++) {
                out[i] = Math.random() * 2 - 1;
            }
        };
        oscillator.connect(staticNode);

//        var filterNode = audioContext.createBiquadFilter();
//        filterNode.type = 0;
//        filterNode.frequency.value = 1000;
//        staticNode.connect(filterNode);

        var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
            attackTime,
            1,
            decayTime,
            0,
            releaseTime,
            audioContext,
            staticNode
        );
        proxy.getSource().connect(audioContext.destination);

        return proxy;

    };

    var bulletToneDuration = beatDuration;

    var bulletToneFactory: GB.State.Play.IToneFactory = function() {
        try {
            //var attackTime = Math.random() * 1;
            var attackTime = 0.1;
            //var decayTime = Math.random() * bulletToneDuration / 1000;
            var decayTime = bulletToneDuration / 1000;
            //var releaseTime = Math.random() * 1;
            var releaseTime = 0.2;

            var frequency = Math.random() * 100 + 350; // - 1000
            //var frequency = 392;

            //var lfoFrequency = Math.random() * 10;    // 40
            var lfoFrequency = 6.19
            //var lfoGain = Math.random() * -300 - 300; // - 600
            var lfoGain = -500;

            //var filterFrequency = Math.random();
            var filterFrequency = 0.8;
            //var filterResonance = Math.random();
            var filterResonance = 0.38;

//        console.log("attack Time "+attackTime);
//        console.log("decay Time "+decayTime);
//        console.log("release Time "+releaseTime);
//        console.log("frequency "+frequency);
//        console.log("lfo frequency "+lfoFrequency);
//        console.log("lfo gain "+lfoGain);
//        console.log("filter frequency "+filterFrequency);
//        console.log("filter resonance "+filterResonance);

            var tone = new GB.State.Play.Tone.WebAudioSynthTone(
                frequency,
                2,
                2,
                lfoFrequency,
                lfoGain,
                audioContext
            );
            tone.setFilterFrequency(filterFrequency);
            tone.setFilterResonance(filterResonance);

            var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
                attackTime,
                0.3,
                decayTime,
                0.25,
                releaseTime,
                audioContext,
                tone.getSource(),
                tone
            );
            proxy.getSource().connect(audioContext.destination);

            return proxy;
        } catch( e ) {
            window.alert(""+e);
            return null;
        }
    };

    var dummyToneDuration = beatDuration;
    var dummyToneFactory: GB.State.Play.IToneFactory = function() {

        //var attackTime = Math.random() * 1;
        var attackTime = dummyToneDuration / (1000 * 4);
        //var decayTime = Math.random() * bulletToneDuration / 1000;
        var decayTime = dummyToneDuration / 1000;
        //var releaseTime = Math.random() * 1;
        var releaseTime = dummyToneDuration / (1000 * 4);

        var frequency = Math.random() * 140 + 200; // - 1000
        //var frequency = 392;

        //var lfoFrequency = Math.random() * 10;    // 40
        var lfoFrequency = 3.19
        //var lfoGain = Math.random() * -300 - 300; // - 600
        var lfoGain = -500;

        //var filterFrequency = Math.random();
        var filterFrequency = 1;
        //var filterResonance = Math.random();
        var filterResonance = 0.38;

//        console.log("attack Time "+attackTime);
//        console.log("decay Time "+decayTime);
//        console.log("release Time "+releaseTime);
//        console.log("frequency "+frequency);
//        console.log("lfo frequency "+lfoFrequency);
//        console.log("lfo gain "+lfoGain);
//        console.log("filter frequency "+filterFrequency);
//        console.log("filter resonance "+filterResonance);

        var tone = new GB.State.Play.Tone.WebAudioSynthTone(
            frequency,
            0,
            0,
            lfoFrequency,
            lfoGain,
            audioContext
        );
        tone.setFilterFrequency(filterFrequency);
        tone.setFilterResonance(filterResonance);

        var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
            attackTime,
            1,
            decayTime,
            0.9,
            releaseTime,
            audioContext,
            tone.getSource(),
            tone
        );
        proxy.getSource().connect(audioContext.destination);

        return proxy;
    };



    var creeperToneDuration = beatDuration * 1.5;
    var creeperToneFactory: GB.State.Play.IToneFactory = function() {

        //var attackTime = Math.random() * 1;
        var attackTime = creeperToneDuration / (1000 * 4);
        //var decayTime = Math.random() * bulletToneDuration / 1000;
        var decayTime = creeperToneDuration / 1000;
        //var releaseTime = Math.random() * 1;
        var releaseTime = creeperToneDuration / (1000 * 4);

        var frequency = Math.random() * 100 + 100; // - 1000
        //var frequency = 392;

        //var lfoFrequency = Math.random() * 10;    // 40
        var lfoFrequency = 9.19
        //var lfoGain = Math.random() * -300 - 300; // - 600
        var lfoGain = -500;

        //var filterFrequency = Math.random();
        var filterFrequency = 0.5;
        //var filterResonance = Math.random();
        var filterResonance = 0.2;

//        console.log("attack Time "+attackTime);
//        console.log("decay Time "+decayTime);
//        console.log("release Time "+releaseTime);
//        console.log("frequency "+frequency);
//        console.log("lfo frequency "+lfoFrequency);
//        console.log("lfo gain "+lfoGain);
//        console.log("filter frequency "+filterFrequency);
//        console.log("filter resonance "+filterResonance);

        var tone = new GB.State.Play.Tone.WebAudioSynthTone(
            frequency,
            3,
            2,
            lfoFrequency,
            lfoGain,
            audioContext
        );
        tone.setFilterFrequency(filterFrequency);
        tone.setFilterResonance(filterResonance);

        var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
            attackTime,
            1,
            decayTime,
            0.9,
            releaseTime,
            audioContext,
            tone.getSource(),
            tone
        );
        proxy.getSource().connect(audioContext.destination);

        return proxy;
    };

    var spinnerToneDuration = beatDuration * 0.33;
    var spinnerToneFactory: GB.State.Play.IToneFactory = function() {

        //var attackTime = Math.random() * 1;
        var attackTime = spinnerToneDuration / (1000 * 4);
        //var decayTime = Math.random() * bulletToneDuration / 1000;
        var decayTime = spinnerToneDuration / 1000;
        //var releaseTime = Math.random() * 1;
        var releaseTime = spinnerToneDuration / (1000 * 4);

        var frequency = Math.random() * 150 + 800; // - 1000
        //var frequency = 392;

        //var lfoFrequency = Math.random() * 10;    // 40
        var lfoFrequency = 15
        //var lfoGain = Math.random() * -300 - 300; // - 600
        var lfoGain = -500;

        //var filterFrequency = Math.random();
        var filterFrequency = 0.5;
        //var filterResonance = Math.random();
        var filterResonance = 0.2;

//        console.log("attack Time "+attackTime);
//        console.log("decay Time "+decayTime);
//        console.log("release Time "+releaseTime);
//        console.log("frequency "+frequency);
//        console.log("lfo frequency "+lfoFrequency);
//        console.log("lfo gain "+lfoGain);
//        console.log("filter frequency "+filterFrequency);
//        console.log("filter resonance "+filterResonance);

        var tone = new GB.State.Play.Tone.WebAudioSynthTone(
            frequency,
            3,
            2,
            lfoFrequency,
            lfoGain,
            audioContext
        );
        tone.setFilterFrequency(filterFrequency);
        tone.setFilterResonance(filterResonance);

        var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
            attackTime,
            0.4,
            decayTime,
            0.2,
            releaseTime,
            audioContext,
            tone.getSource(),
            tone
        );
        proxy.getSource().connect(audioContext.destination);

        return proxy;
    };

    var ambulanceToneDuration = beatDuration * 0.75;
    var ambulanceToneFactory: GB.State.Play.IToneFactory = function() {

        //var attackTime = Math.random() * 1;
        var attackTime = ambulanceToneDuration / (1000 * 4);
        //var decayTime = Math.random() * bulletToneDuration / 1000;
        var decayTime = ambulanceToneDuration / 1000;
        //var releaseTime = Math.random() * 1;
        var releaseTime = ambulanceToneDuration / (1000 * 4);

        var frequency = Math.random() * 200 + 600; // - 1000
        //var frequency = 392;

        //var lfoFrequency = Math.random() * 10;    // 40
        var lfoFrequency = 2;
        //var lfoGain = Math.random() * -300 - 300; // - 600
        var lfoGain = -500;

        //var filterFrequency = Math.random();
        var filterFrequency = 0.5;
        //var filterResonance = Math.random();
        var filterResonance = 0.2;

//        console.log("attack Time "+attackTime);
//        console.log("decay Time "+decayTime);
//        console.log("release Time "+releaseTime);
//        console.log("frequency "+frequency);
//        console.log("lfo frequency "+lfoFrequency);
//        console.log("lfo gain "+lfoGain);
//        console.log("filter frequency "+filterFrequency);
//        console.log("filter resonance "+filterResonance);

        var tone = new GB.State.Play.Tone.WebAudioSynthTone(
            frequency,
            2,
            1,
            lfoFrequency,
            lfoGain,
            audioContext
        );
        tone.setFilterFrequency(filterFrequency);
        tone.setFilterResonance(filterResonance);

        var proxy = new GB.State.Play.Tone.WebAudioManualPannerToneProxy(
            attackTime,
            0.6,
            decayTime,
            0.5,
            releaseTime,
            audioContext,
            tone.getSource(),
            tone
        );
        proxy.getSource().connect(audioContext.destination);

        return proxy;
    };

    var playStateFactory = (oldState:GB.State.IState, practise: boolean, enableCompass: boolean) => {

        var explosionMind = new GB.State.Play.Mind.ExplosionMind(explosionToneDuration, 30);
        var explosionFactory = (x:number, y:number, z:number, zAngle:number) => {
            var explosion = new GB.State.Play.Monster(
                explosionMind,
                explosionToneFactory(),
                GB.State.Play.PlayState.MONSTER_TYPE_EXPLOSION,
                GB.State.Play.PlayState.MONSTER_TYPE_EXPLOSION_SUBTYPE_NORMAL,
                GB.State.Play.PlayState.MONSTER_STATE_NORMAL,
                x, y, z,
                zAngle,
                0
            );
            return explosion;
        };

        var bulletMind = new GB.State.Play.Mind.BulletMind(0, 0, 0.1);

        var bulletFactory = (x:number, y:number, z:number, zAngle:number) => {
            var bullet = new GB.State.Play.Monster(
                bulletMind,
                bulletToneFactory(),
                GB.State.Play.PlayState.MONSTER_TYPE_BULLET,
                GB.State.Play.PlayState.MONSTER_TYPE_BULLET_SUBTYPE_NORMAL,
                GB.State.Play.PlayState.MONSTER_STATE_NORMAL,
                x, y, z,
                zAngle,
                3
            );
            return bullet;
        };


        var playerMind = new GB.State.Play.Mind.PlayerMind(bulletFactory);

        var levelFactory = (player: GB.State.Play.Monster) => {


            var weights = [];

            weights.push(
                new GB.State.Play.Spawner.RandomSpawnerWeight(
                    40,
                    4,
                    1,
                    GB.State.Play.PlayState.MONSTER_TYPE_CREEPER,
                    GB.State.Play.PlayState.MONSTER_TYPE_CREEPER_SUBTYPE_NORMAL,
                    (aggression:number) => {
                        return new GB.State.Play.Mind.CreeperMind(explosionFactory, 2000, 1000, 0.003 * aggression);
                    },
                    creeperToneFactory
                )
            );
            weights.push(
                new GB.State.Play.Spawner.RandomSpawnerWeight(
                    20,
                    6,
                    1,
                    GB.State.Play.PlayState.MONSTER_TYPE_DUMMY,
                    GB.State.Play.PlayState.MONSTER_TYPE_DUMMY_SUBTYPE_NORMAL,
                    (aggression:number) => {
                        return new GB.State.Play.Mind.DummyMind(explosionFactory, 2000, 1000, 0.002 * aggression);
                    },
                    dummyToneFactory
                )
            );
            weights.push(
                new GB.State.Play.Spawner.RandomSpawnerWeight(
                    10,
                    10,
                    1,
                    GB.State.Play.PlayState.MONSTER_TYPE_SPINNER,
                    GB.State.Play.PlayState.MONSTER_TYPE_SPINNER_SUBTYPE_NORMAL,
                    (agression:number) => {
                        return new GB.State.Play.Mind.SpinningMind(
                            explosionFactory,
                            2000,
                            1000,
                            0.01 * agression,
                            0.001 * agression,
                            Math.random() > 0.5
                        )
                    },
                    spinnerToneFactory
                )
            );
            weights.push(
                new GB.State.Play.Spawner.RandomSpawnerWeight(
                    5,
                    20,
                    1,
                    GB.State.Play.PlayState.MONSTER_TYPE_AMBULANCE,
                    GB.State.Play.PlayState.MONSTER_TYPE_AMBULANCE_SUBTYPE_NORMAL,
                    (aggression:number) => {
                        return new GB.State.Play.Mind.DummyMind(explosionFactory, 5000, 1000, 0.005 * aggression);
                    },
                    ambulanceToneFactory
                )
            );

            var spawner = new GB.State.Play.Spawner.RandomSpawner(
                10,
                5,
                70,
                95,
                weights
            );

            var bars:{[_:number]:GB.State.Play.ToneSequencerBar} = {};
            bars[GB.State.Play.PlayState.MONSTER_TYPE_DUMMY] = new GB.State.Play.ToneSequencerBar(2, dummyToneDuration);
            bars[GB.State.Play.PlayState.MONSTER_TYPE_BULLET] = new GB.State.Play.ToneSequencerBar(1, bulletToneDuration);
            bars[GB.State.Play.PlayState.MONSTER_TYPE_CREEPER] = new GB.State.Play.ToneSequencerBar(4, creeperToneDuration);
            bars[GB.State.Play.PlayState.MONSTER_TYPE_SPINNER] = new GB.State.Play.ToneSequencerBar(1, spinnerToneDuration);
            bars[GB.State.Play.PlayState.MONSTER_TYPE_AMBULANCE] = new GB.State.Play.ToneSequencerBar(2, ambulanceToneDuration);

            var level = new GB.State.Play.Level(100, spawner, player, new GB.State.Play.ToneSequencer(bars));
            return level;
        };
        var player = new GB.State.Play.Monster(
            playerMind,
            new GB.State.Play.Tone.NoTone(beatDuration),
            GB.State.Play.PlayState.MONSTER_TYPE_PLAYER,
            GB.State.Play.PlayState.MONSTER_TYPE_PLAYER_SUBTYPE_P1,
            GB.State.Play.PlayState.MONSTER_STATE_NORMAL,
            0, 0, 0, 0, 5
        );
        var playState = new GB.State.Play.PlayState(
            playTransformer,
            practise,
            enableCompass,
            6,
            levelFactory,
            player,
            oldState,
            audioContext
        );
        return playState;
    };

    var homeTemplate = document.getElementById("home-template").innerHTML;
    var homeTransformer = GB.Transformer.createTransformerFactoryFromString<GB.State.Home.HomeData>(xslTransformerFactory, homeTemplate)();
    var homeState = new GB.State.Home.HomeState(homeTransformer, playStateFactory, audioContext);

    var content = document.getElementById("content");
    var stateEngine = new GB.State.StateEngine(content);
    stateEngine.setCurrentState(homeState);
};