// CameraControls.js

export class CameraControls {
    constructor(camera, cameraSpeed = 0.1) {
        this.camera = camera;
        this.cameraSpeed = cameraSpeed;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    // Handle keydown events
    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'KeyD':
                this.moveRight = true;
                break;
        }
    }

    // Handle keyup events
    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }

    // Update camera position based on the current key states
    updateCameraPosition() {
        if (this.moveForward) this.camera.position.y += this.cameraSpeed;
        if (this.moveBackward) this.camera.position.y -= this.cameraSpeed;
        if (this.moveLeft) this.camera.position.x -= this.cameraSpeed;
        if (this.moveRight) this.camera.position.x += this.cameraSpeed;
    }

    // Function to get the current camera position
    getCameraPosition() {
        return this.camera.position;
    }
}
