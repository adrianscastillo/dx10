// DX10 Blob Effect using p5.js
// Creates organic, animated blob shapes with DX10 branding colors

let blobs = [];
let numBlobs = 5;
let time = 0;

class Blob {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(80, 150);
        this.angle = 0;
        this.angleSpeed = random(0.005, 0.015);
        this.noiseOffset = random(1000);
        this.color = this.getDX10Color();
        this.alpha = random(20, 40);
        this.pulseSpeed = random(0.02, 0.05);
        this.pulseOffset = random(TWO_PI);
    }

    getDX10Color() {
        // DX10 brand colors - whites, grays, and subtle blues
        let colors = [
            [255, 255, 255], // White
            [240, 240, 240], // Light gray
            [220, 220, 220], // Gray
            [200, 200, 200], // Darker gray
            [180, 180, 200], // Subtle blue-gray
        ];
        return random(colors);
    }

    update() {
        this.angle += this.angleSpeed;
        this.noiseOffset += 0.008;
        time += 0.01;
    }

    display() {
        push();
        translate(this.x, this.y);
        
        // Create organic blob shape using noise
        let pulse = sin(time * this.pulseSpeed + this.pulseOffset) * 0.2 + 0.8;
        let currentSize = this.size * pulse;
        
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        noStroke();
        
        beginShape();
        for (let i = 0; i < TWO_PI; i += 0.05) {
            let noiseVal = noise(
                cos(i) * 0.8 + this.noiseOffset,
                sin(i) * 0.8 + this.noiseOffset,
                time * 0.5
            );
            let r = currentSize + noiseVal * 60;
            let x = cos(i) * r;
            let y = sin(i) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        pop();
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('blob-container');
    
    // Create blobs in strategic positions
    for (let i = 0; i < numBlobs; i++) {
        let x, y;
        if (i === 0) {
            // Center blob
            x = width * 0.5;
            y = height * 0.3;
        } else if (i === 1) {
            // Top right
            x = width * 0.8;
            y = height * 0.2;
        } else if (i === 2) {
            // Bottom left
            x = width * 0.2;
            y = height * 0.7;
        } else if (i === 3) {
            // Top left
            x = width * 0.3;
            y = height * 0.4;
        } else {
            // Random position
            x = random(width);
            y = random(height);
        }
        
        blobs.push(new Blob(x, y));
    }
}

function draw() {
    // Create subtle fade effect
    background(0, 0, 0, 15);
    
    // Update and display blobs
    for (let blob of blobs) {
        blob.update();
        blob.display();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
