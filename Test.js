import * as THREE from 'https://threejs.org/build/three.module.js';




function main() {
  const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true});
  const raycaster = new THREE.Raycaster();
  const pickPosition = { x: 0, y: 0 };
    var mouse = new THREE.Vector2();
    var cameraLerpTarget = new THREE.Vector3(0, 0, 0);
    const cubeColor = new THREE.Color(1, 1, 1);

  const fov = 20;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 50;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 4;
    camera.position.x = 2;
    cameraLerpTarget = camera.position;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

  const scene = new THREE.Scene();

  {
        const color = 0xFFFFFF;
        //const color = 0x00FFFF;
        const intensity = 0.1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);

        const backintensity = 0.5;
        const backlightcolor = 0xFF0000;
        const backlight = new THREE.DirectionalLight(backlightcolor, backintensity);
        backlight.position.set(-1, 2, -4);
        backlight.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(backlight);

        const backintensity2 = 0.5;
        const backlightcolor2 = 0xAAAAFF;
        const backlight2 = new THREE.DirectionalLight(backlightcolor2, backintensity2);
        backlight2.position.set(1, -2, -4);
        backlight2.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(backlight2);
  }

  const boxWidth = 0.2;
  const boxHeight = 0.2;
  const boxDepth = 0.6;
  const geometry = new THREE.BoxGeometry(boxWidth-0.002, boxHeight-0.002, boxDepth);

  function makeInstance(geometry, matColor, x, y, z) {

     let material = new THREE.MeshStandardMaterial({ color: matColor, roughness:0.3 });
      //material.roughness = 0.3;
     

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

      cube.position.x = x;
      cube.position.y = y;
      cube.position.z = z;

      if (Math.random() < 0.1) {
          
          const lightColor = new THREE.Color(0.2, 0.2,0.2);
          const newLight = new THREE.PointLight(lightColor, 0.5, 2);
          newLight.position.set(x,y,z+1);
          cube.add(newLight);
      }

    return cube;
    }

    
    //make cube array
    const arrayWidth = 10;
    const arrayHeight = 5;
    const cubes = [];
   
    let cubeCount = 0;
    
    for (let i = -arrayWidth; i < arrayWidth; i++) {
        
        for (let j = -arrayHeight; j < arrayHeight; j++) {                       
            const cube = makeInstance(geometry, cubeColor, i / 5, j / 5, Math.random() * 0.01);           
            cubes[cubeCount] = cube;
            cubeCount++;
        }
        
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        if (!pause) {
            time *= 0.001;  // convert time to seconds

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            cubes.forEach((cube, ndx) => {
                cube.material.color.lerp(cubeColor, 0.02);
                if (cube.position.z > 0) {
                    cube.position.z = cube.position.z * 0.99;
                }
            });

            camera.position.lerp(cameraLerpTarget, 0.02);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            renderer.render(scene, camera);
        }
   
        requestAnimationFrame(render);//loop
  }
  requestAnimationFrame(render);


    const elem = document.querySelector('#pause');
    elem.addEventListener('click', () => {
        onPauseToggle();
    });

    let pause = false;

    function onPauseToggle() {
        pause = !pause;
    }

    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height,
        };
    }
    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.width) * 2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
    }
    function onClick(event) {
        setPickPosition(event);
        raycaster.setFromCamera(pickPosition, camera)
        const intersectedObjects = raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            let pickedObject = intersectedObjects[0].object;
            cubes.forEach((cube, ndx) => {
                if (cube == pickedObject) {
                    cube.material.color = new THREE.Color(0, 0, 0);
                }
            });
        }
    }

    function onMouseMove(event) {
        setPickPosition(event);
        raycaster.setFromCamera(pickPosition, camera)
        const intersectedObjects = raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            let pickedObject = intersectedObjects[0].object;
           

            for (let i = 0; i < (arrayHeight * 2) * (arrayWidth * 2); i++)
            {
                let cube = cubes[i];
                if (cube == pickedObject) {
                    cube.position.z = cube.position.z + 0.005;

                    let cube1 = cubes[i + 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.003; }
                    cube1 = cubes[i - 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.003; }

                    cube1 = cubes[i + arrayWidth];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.003; }
                    cube1 = cubes[i - arrayWidth];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.003; }

                    cube1 = cubes[i + arrayWidth + 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.001; }
                    cube1 = cubes[i - arrayWidth - 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.001; }
                    cube1 = cubes[i - arrayWidth + 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.001; }
                    cube1 = cubes[i + arrayWidth - 1];
                    if (cube1 != null) { cube1.position.z = cube1.position.z + 0.001; }
                }

            }
           
        }

        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        cameraLerpTarget = new THREE.Vector3(-mouse.x, -mouse.y, camera.position.z);
      
    }


    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);
}

main();
