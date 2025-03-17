const fileInput = document.getElementById('file-input');
const modelContainer = document.getElementById('model-container');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const rotateCheckbox = document.getElementById('rotate-checkbox');
const wireframeCheckbox = document.getElementById('wireframe-checkbox');

// Load GLTF model from file input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const url = e.target.result;

        // Clear old models
        clearOldModels();

        // New model
        loadModel(url);
    };

    reader.readAsDataURL(file);
});

// Function to load a model
function loadModel(url) {
    // Clear old models
    clearOldModels();

    // Create new model entity
    const newModel = document.createElement('a-entity');
    newModel.setAttribute('id', 'model');
    newModel.setAttribute('gltf-model', url);
    newModel.setAttribute('shadow', 'cast: true');
    newModel.setAttribute('shadow', 'receive: false');
    modelContainer.appendChild(newModel);

    // Wireframe logic
    const scene = document.querySelector('a-scene');
    const loader = new THREE.GLTFLoader();

    loader.load(url, function (gltf) {
        const object = gltf.scene;

        object.traverse((node) => {
            if (node.isMesh) {
                node.material.wireframe = true;
                node.material.color.set(0x0000ff);
            }
        });

        const aEntity = document.createElement('a-entity');
        aEntity.id = 'model-wireframe';
        aEntity.visible = false;
        aEntity.setObject3D('mesh', object);
        scene.appendChild(aEntity);

        // Update visibility based on wireframe checkbox
        document.getElementById('model').setAttribute('visible', !wireframeCheckbox.checked);
        document.getElementById('model-wireframe').setAttribute('visible', wireframeCheckbox.checked);

        // Adjust camera position based on model size
        const boundingBox = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const modelCenter = boundingBox.getCenter(new THREE.Vector3());
        const distance = Math.max(size.x, size.y, size.z) * 2; // Adjust the multiplier for desired camera distance

        // Set the camera position
        const camera = document.querySelector('a-camera');
        camera.setAttribute('position', {
            x: modelCenter.x,
            y: modelCenter.y + size.y / 2, // Adjust slightly upwards to keep the model centered in view
            z: modelCenter.z + distance,
        });
    });
}


// Function to clear old models and wireframes
function clearOldModels() {
    const oldModel = modelContainer.querySelector('#model');
    if (oldModel) {
        modelContainer.removeChild(oldModel);
    }

    const oldWireframe = document.querySelector('#model-wireframe');
    if (oldWireframe) {
        oldWireframe.parentNode.removeChild(oldWireframe);
    }
}

// Event listeners for the sample model buttons
document.getElementById('load-model-1').addEventListener('click', () => {
    loadModel('./models/teapot.gltf');
});

document.getElementById('load-model-2').addEventListener('click', () => {
    loadModel('./models/suzanne.gltf'); 
});



let rotating = false;
let rotationSpeed = 0;
let lastTimestamp = 0;
let lastRotation = { y: 0 };

function rotateModel(timestamp) {
    if (!rotating) return;

    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const model = modelContainer.querySelector('a-entity');
    if (model) {
        let currentRotation = model.getAttribute('rotation');
        currentRotation.y = lastRotation.y - (rotationSpeed * deltaTime) / 16;
        model.setAttribute('rotation', currentRotation);
        lastRotation.y = currentRotation.y; // Actualizar la última rotación
    }

    const wireframe = document.querySelector('#model-wireframe');
    if (wireframe) {
        let wireframeRotation = wireframe.getAttribute('rotation');
        wireframeRotation.y = lastRotation.y - (rotationSpeed * deltaTime) / 16;
        wireframe.setAttribute('rotation', wireframeRotation);
    }

    if (rotating) {
        requestAnimationFrame(rotateModel);
    }
}

// Speed Slider
speedSlider.addEventListener('input', () => {
    const speed = speedSlider.value;
    rotationSpeed = speedSlider.value;
    speedValue.textContent = speed;
});

// CheckBox Init rotation
rotateCheckbox.addEventListener('change', () => {
    rotating = rotateCheckbox.checked;

    if (rotating) {
        requestAnimationFrame(rotateModel);
    } else {
        lastTimestamp = 0;
    }
});

// Checkbox wireframe
wireframeCheckbox.addEventListener('change', () => {
    document.getElementById('model').setAttribute('visible', !wireframeCheckbox.checked);
    document.getElementById('model-wireframe').setAttribute('visible', wireframeCheckbox.checked);
});

