const cvs = document.querySelector('#canvas');
        const ctx = cvs.getContext("2d");
        let frames = 0;
        const DEGREE = Math.PI / 180;
        //state of the game object..
        const state = {
            current: 0,
            getReady: 0,
            game: 1,
            over: 2
        }
        //Game Soung
        const SCORE_S=new Audio();
        SCORE_S.src="audio/point.wav";

        const FLAP=new Audio();
        FLAP.src="audio/flap.wav";

        const HIT=new Audio();
        HIT.src="audio/hit.wav";

        const DIE=new Audio();
        DIE.src="audio/die.wav";

        const SWOOSHING=new Audio();
        SWOOSHING.src="audio/swooshing.wav";


        //GAME CONTROL OF STATES
        cvs.addEventListener('click', function(event){
            switch (state.current) {
                case state.getReady:
                    state.current = state.game;
                    SWOOSHING.play();
                    break;
                case state.game:
                    bird.flap();
                    FLAP.play();
                    break;
                case state.over:
                    let rect=cvs.getBoundingClientRect();
                    let clientX=event.clientX-rect.left;
                    let clientY=event.clientY-rect.top;
                    if(clientX>startButton.x && clientX<=startButton.x + startButton.w&&
                    clientY>startButton.y && clientY<=startButton.y + startButton.h)
                    {
                        pipes.restart();
                        bird.restart();
                        state.current = state.getReady;
                    }
                    break;
            }
        });
        document.addEventListener("keydown",function(event){
            if(event.keyCode===32){
                //space
                switch (state.current) {
                case state.getReady:
                    SWOOSHING.play();
                    state.current = state.game;
                    break;
                case state.game:
                    bird.flap();
                    FLAP.play();
                    break;
            }
            }
        })
        
        //object of background image of the canvas
        const bg = {
            img: new Image(),
            w: 288,
            h: 512,
            x: 0,
            y: 0,
            //draw function of background
            draw: function () {
                this.img.src = 'image/bg.png';
                ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
            }
        };
        //gameStart before play
        const get_Ready = {
            img: new Image(),
            w: 173,
            h: 161,
            x: cvs.width / 2 - 173 / 2,
            y: 80,
            //draw function of background
            draw: function () {
                if (state.current == state.getReady) {
                    this.img.src = 'image/getready.png';
                    ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
                }

            }
        }
        //gameover object
        const gameOver = {
            img: new Image(),
            w: 230,
            h: 204,
            x: cvs.width / 2 - 230 / 2,
            y: 100,
            //draw function of background
            draw: function () {
                if (state.current == state.over) {
                    this.img.src = 'image/gameoverCopy.png';
                    ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
                }
            }
        }
        //StartButton
        const startButton={
            x:gameOver.x+72,
            y:gameOver.y+171,
            w:83,
            h:29
        }
        //base image object
        const fg = {
            img: new Image(),
            w: 336,
            h: 112,
            x: 0,
            y: cvs.height - 112,
            dx: 2,
            //draw function of bottom image
            draw: function () {
                this.img.src = 'image/base.png';
                ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
            },
            update: function () {
                if (state.current == state.game) {
                    this.x = (this.x - this.dx) % (this.h / 2 - 10);
                }
            }
        };
        //bird Object
        const bird = {
            animation: [
                { imgSrc: 'image/bird1.png' },
                { imgSrc: 'image/bird2.png' },
                { imgSrc: 'image/bird3.png' },
                { imgSrc: 'image/bird1.png' }
            ],
            //speed  for upword and downword
            speed: 0,
            gravity: 0.25,
            jump: 4.6,
            rotation: 0,

            img: new Image(),
            w: 34,
            h: 24,
            x: 30,
            y: 150,
            frame: 0,
            radius: 12,
            //draw function of bird
            draw: function () {

                let obj = this.animation[this.frame];
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                this.img.src = obj.imgSrc;
                ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
                ctx.restore();
            },
            flap: function () {
                this.speed = -this.jump;

            },
            update: function () {
                //if the game is in Getready state flap slowly
                this.period = state.current == state.getReady ? 10 : 5;
                //increment the frame by 1 
                this.frame += frames % this.period == 0 ? 1 : 0;
                //frame animation is from 0-4 so
                this.frame = this.frame % this.animation.length;
                if (state.current == state.getReady) {
                    this.y = 150;
                    this.speed = 0;
                    this.rotation = 0 * DEGREE;
                }
                else {
                    this.speed += this.gravity;
                    this.y += this.speed;
                    if(this.y<=0)
                    {
                        state.current=state.over;
                        DIE.play();
                        this.restart();
                    }
                    if (this.y + this.h / 2 >= cvs.height - fg.h) {
                        this.y = cvs.height - fg.h - this.h/2;
                        // this.y = cvs.height - fg.h - this.h / 2 - (this.h - 10);
                        if (state.current == state.game) {
                            state.current = state.over;
                            DIE.play();
                            this.frame=1;
                           this.restart();
                            
                        }
                    }
                    //If SPeed > Jump mean birds falling down
                    if (this.speed >= this.jump) {
                        this.rotation = 90 * DEGREE;
                        this.frame = 1;
                    }
                    else {
                        this.rotation = -25 * DEGREE;
                    }
                }
            },
            restart:function(){
                pipes.restart();
                this.speed=0;
            }
        }
        //PIPE objects
        const pipes = {
            position: [],
            pipeImage: [
                { imgSrc: 'image/toppipe.png' },
                { imgSrc: 'image/bottompipe.png' }
            ],
            img: new Image(),
            img1: new Image(),

            w: 52,
            h: 320,
            maxYPos: -150,
            dx: 2,
            gap: 100,
            draw: function () {
                for (let i = 0; i < this.position.length; i++) {
                    let p = this.position[i];

                    let topYPos = p.y;
                    let bottomYPos = p.y + this.h + this.gap;
                    //top pipe
                    let obj = this.pipeImage[0];
                    this.img.src = obj.imgSrc;
                    // console.log(this.img);
                    ctx.drawImage(this.img, p.x, topYPos, this.w, this.h);
                    //bottomPipe
                    let obj1 = this.pipeImage[1];
                    this.img1.src = obj1.imgSrc;
                    // console.log(this.img1);
                    ctx.drawImage(this.img1, p.x, bottomYPos, this.w, this.h);

                }
            },
            update: function () {
                if (state.current !== state.game) return;
                if (frames % 100 == 0) {
                    this.position.push({
                        x: cvs.width,
                        y: this.maxYPos * (Math.random() + 1)
                    });
                }
                for (let i = 0; i < this.position.length; i++) {
                    let p = this.position[i];

                    let bottomPipeY = p.y + this.h + this.gap;
                    //COLLISON DETECTION
                    //TOP PIPE
                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                        bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                        state.current = state.over;
                        HIT.play();
                        DIE.play();
                        this.restart();
                        console.log('gameovertop');

                    }
                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                        bird.y + bird.radius > bottomPipeY && bird.y - bird.radius < bottomPipeY + this.h) {
                        state.current = state.over;
                        HIT.play();
                        DIE.play();
                        console.log('gameoverBottom');
                        this.restart();
                    }

                    //move to left
                    p.x -= this.dx;
                    if (p.x + this.w <= 0) {
                        console.log('pipeshift');
                        this.position.shift();
                        score.value+=1;
                        SCORE_S.play();
                        score.best=Math.max(score.value,score.best);
                        localStorage.setItem("best",score.best);
                    }

                }
            },
            restart:function(){
                this.position.splice(0,this.position.length);
            }
        }
        const score={
            best: parseInt(localStorage.getItem("best")) || 0,
            value: 0,

            draw: function(){
                ctx.fillStyle="white";
                ctx.strokeStyle="white";
                if(state.current==state.game){
                    ctx.lineWidth=2;
                    ctx.font="35px Teko";
                    ctx.fillText(this.value,cvs.width/2,50);
                    ctx.strokeText(this.value,cvs.width/2,50);
                }
                else if(state.current==state.over)
                {
                    ctx.fillStyle="brown";
                    ctx.strokeStyle="brown";
                     ctx.font="25px Teko";
                    //score value
                    ctx.fillText(this.value,210,200);
                    ctx.strokeText(this.value,210,200);
                    //best value
                    ctx.fillText(this.best,210,240);
                    ctx.strokeText(this.best,210,240);
                }
                else if(state.current==state.getReady)
                {
                    this.value=0;
                }
            }
        }

        draw = function () {
            bg.draw();
            pipes.draw();
            fg.draw();
            bird.draw();
            get_Ready.draw();
            gameOver.draw();
            score.draw();

        }
        update = function () {
            bird.update();
            fg.update();
            pipes.update();
        }
        loop = function () {
            update();
            draw();

            frames++;
            requestAnimationFrame(loop);//50ms 
        }
        loop();