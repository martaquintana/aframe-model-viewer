  const fileInput = document.getElementById('file-input');
      const modelContainer = document.getElementById('model-container');
      const speedSlider = document.getElementById('speed-slider');
      const speedValue = document.getElementById('speed-value');
      const rotateCheckbox = document.getElementById('rotate-checkbox');


      // Cargar el modelo GLTF
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target.result;

	  // Elimina cualquier modelo y wireframe previo de la escena
          const oldModel = modelContainer.querySelector('#model');
          if (oldModel) {
            modelContainer.removeChild(oldModel);
          }
          
          const oldWireframe = document.querySelector('#model-wireframe');
          if (oldWireframe) {
            oldWireframe.parentNode.removeChild(oldWireframe);
          }

          // Añade el nuevo modelo
          const newModel = document.createElement('a-entity');
          newModel.setAttribute('id','model');
          newModel.setAttribute('gltf-model', url);
          newModel.setAttribute('shadow', 'cast: true'); // Habilita las sombras del modelo
          newModel.setAttribute('shadow', 'receive: false'); // Habilita las sombras del modelo
          modelContainer.appendChild(newModel);

	  //Wireframe
	  const scene = document.querySelector('a-scene');
          const loader = new THREE.GLTFLoader();


		loader.load(url, function(gltf) {
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
		    
  	            const wireframeCheckbox = document.getElementById('wireframe-checkbox');
		    document.getElementById('model').setAttribute('visible', !wireframeCheckbox.checked );
		    document.getElementById('model-wireframe').setAttribute('visible', wireframeCheckbox.checked );

		});
 	
		
        };

        reader.readAsDataURL(file);
	

      });

let rotating = false;
let rotationSpeed = 1; // Valor inicial de la velocidad
let lastTimestamp = 0;

// Función para actualizar la rotación manualmente
function rotateModel(timestamp) {
  if (!rotating) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // Calcular la nueva rotación en función del tiempo transcurrido
  const model = modelContainer.querySelector('a-entity');
  if (model) {
    let currentRotation = model.getAttribute('rotation');
    currentRotation.y -= (rotationSpeed * deltaTime) / 16; 
    model.setAttribute('rotation', currentRotation);
  }
  const wireframe = document.querySelector('#model-wireframe');
    if (wireframe) {
      let wireframeRotation = wireframe.getAttribute('rotation');
      wireframeRotation.y -= (rotationSpeed * deltaTime) / 16;
      wireframe.setAttribute('rotation', wireframeRotation);
    }

  requestAnimationFrame(rotateModel);
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
  }
});

// Checkbox wireframe

 const wireframeCheckbox = document.getElementById('wireframe-checkbox');


  wireframeCheckbox.addEventListener('change', () => {
	document.getElementById('model').setAttribute('visible', !wireframeCheckbox.checked );
        document.getElementById('model-wireframe').setAttribute('visible', wireframeCheckbox.checked );
  });



