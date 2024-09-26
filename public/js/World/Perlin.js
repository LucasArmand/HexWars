export class Perlin {
    constructor() {
        this.perm = [];
        this.generatePermutation();
    }

    generatePermutation() {
        const permutation = [];
        for (let i = 0; i < 256; i++) {
            permutation[i] = i;
        }

        // Shuffle the array
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }

        this.perm = [...permutation, ...permutation];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y = 0, z = 0) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w, 
            this.lerp(v, 
                this.lerp(u, this.grad(this.perm[AA], x, y, z), 
                              this.grad(this.perm[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.perm[AB], x, y - 1, z), 
                              this.grad(this.perm[BB], x - 1, y - 1, z))
            ),
            this.lerp(v, 
                this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1), 
                              this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1), 
                              this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }
}