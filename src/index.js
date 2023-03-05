import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CCDIKSolver } from "three/examples/jsm/animation/CCDIKSolver.js";

import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper } from "three-ik";

//stackoverflow.com/questions/1966587/given-3-points-how-do-i-calculate-the-normal-vector

const boneLookAt = (window.boneLookAt = (bone, position) => {
  var target = new THREE.Vector3(
    position.x - bone.matrixWorld.elements[12],
    position.y - bone.matrixWorld.elements[13],
    position.z - bone.matrixWorld.elements[14]
  ).normalize();
  var v = new THREE.Vector3(0, 0, 1);
  var q = new THREE.Quaternion().setFromUnitVectors(v, target);
  var tmp = q.z;
  q.z = -q.y;
  q.y = tmp;
  bone.quaternion.copy(q);
});

THREE.Object3D.prototype.worldToLocal = function (vector) {
  if (!this.__inverseMatrixWorld)
    this.__inverseMatrixWorld = new THREE.Matrix4();
  return vector.applyMatrix4(
    this.__inverseMatrixWorld.getInverse(this.matrixWorld)
  );
};

https: window.THREE = THREE;

async function loadMesh(path, file) {
  return new Promise(function (resolve) {
    const loader = new GLTFLoader().setPath(path);
    loader.load(file, function (gltf) {
      //gltf.scene.updateMatrixWorld()
      gltf.scene.traverse((i) => {
        if (i.frustumCulled) {
          i.frustumCulled = false;
        }
      });
      resolve(gltf.scene);
    });
  });
}

async function findObjectItem(object, name) {
  //console.log(object);
  return new Promise(function (resolve) {
    object.traverse((child) => {
      //console.log("child", child);
      if (child.name == name) {
        resolve(child);
      }
    });
  });
}

let container;
let camera, scene, renderer, controls;

let IKSolver;
let arm;

const ik = new IK();
const chain = new IKChain();
const constraints = [new IKBallConstraint(90)];
const bones = [];
let target;

init();
animate();

(async () => {
  const gltf = await loadMesh("/public/", "xbot.glb");
  scene.add(gltf);
  const bot = (window.bot = await findObjectItem(gltf, "Beta_Surface"));
  const helper = new THREE.SkeletonHelper(bot.parent);
  scene.add(helper);

  const bone = (window.bone = bot.skeleton.bones.find(
    (i) => i.name === "mixamorigLeftArm"
  ));

  const targetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  targetMesh.position.set(2, 0, 2);
  // bone.parent.add(targetMesh);
  scene.add(targetMesh);
  bone.lookAt(targetMesh.position);
  // bone.rotation.y += -Math.PI / 2;

  const bone2 = (window.bone2 = bot.skeleton.bones.find(
    (i) => i.name === "mixamorigLeftForeArm"
  ));

  // bone.rotation.z = -.5
  // bone.rotation.y = -.5

  // bone2.rotation.y = -1

  //bone.lookAt(new THREE.Vector3(-100, 0, 100));

  console.log(bone);
  // const gltf = await loadMesh("/public/", "test-blender-rig.glb");
  // //console.log(gltf);
  // //console.log(await findObjectItem(gltf, "left-leg-top"));
  // scene.add(gltf);
  // gltf.updateMatrixWorld();
  // const helper = new THREE.SkeletonHelper(gltf);
  // scene.add(helper);
  // //console.log(leg.skeleton);
  // // leg
  // const leg = await findObjectItem(gltf, "left-leg-top");
  // // skinnedMesh.skeleton.bones[0].position.z += .3;
  // leg.skeleton.bones[0].position.y += -1;
  // leg.skeleton.bones[0].rotation.x += -1;
  // leg.skeleton.bones[1].rotation.x += -1;
  // // arm
  // arm = window.arm = await findObjectItem(gltf, "left-arm-start");
  // // //arm.skeleton.bones[0].position.y += -0;
  // //arm.skeleton.bones[0].rotation.y = -1;
  // //arm.skeleton.bones[0].rotation.z = -1;
  // //arm.skeleton.bones[1].rotation.x = 1;
  // const hand = (window.hand = await findObjectItem(gltf, "left-arm-hand"));
  // // console.log(hand)
  // // arm.skeleton.bones[0].lookAt(hand.position)
  // // arm.skeleton.bones[1].lookAt(hand.position)
  // // arm.skeleton.bones[1].lookAt(new THREE.Vector3(0, 100, 0));
  // //  arm.skeleton.bones[0].lookAt(hand.position);
  // //  arm.skeleton.bones[1].lookAt(hand.position);
  // //boneLookAt(arm.skeleton.bones[0], hand.getWorldPosition());
  // //console.log(hand.position, hand.getWorldPosition());
  // const armIks = [
  //   {
  //     target: 0,
  //     effector: 1,
  //     //links: [],
  //     links: [{ index: 0 }, { index: 1 }],
  //     iteration: 10,
  //     minAngle: 0.0,
  //     maxAngle: 1.0
  //   }
  // ];
  // //console.log(arm, CCDIKSolver);
  // IKSolver = window.IKSolver = new CCDIKSolver(arm, armIks);
  // //// arm.updateMatrixWorld(true);
  // //IKSolver.update();
  // // IKSolver.update();
  // // console.log(scene)
  // //console.log();
  // // const bone1 = arm.skeleton.bones[0];
  // // bones.push(bone1);
  // // chain.add(new IKJoint(bone1, { constraints }), { target: null });
  // // const bone2 = arm.skeleton.bones[1];
  // // bone1.add(bone2);
  // // bones.push(bone2);
  // // target = await findObjectItem(gltf, "left-arm-hand");
  // // chain.add(new IKJoint(bone2, { constraints }), { target: target });
  // // ik.add(chain);
  // //scene.add(new IKHelper(ik));
})();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = window.scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(0.5);
  scene.add(axesHelper);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(1, 0.5, 1);

  // const ambientLight = new THREE.AmbientLight(0xffffff);
  // ambientLight.position.set(0.5, 1, 0.25);
  // scene.add(ambientLight);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  renderer = window.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const gridHelper = new THREE.GridHelper(10, 10, 0xeeeeee, 0xeeeeee);
  scene.add(gridHelper);

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 10500;

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (arm) {
    // arm.skeleton.bones[1].position.y = 0.8 * Math.sin(timestamp / 1000);
    // arm.skeleton.bones[1].position.x = -0.8 * Math.cos(timestamp / 1000);
    // arm.skeleton.bones[1].position.z = -0.8 * Math.sin(timestamp / 1000);
    //IKSolver.update();
  }

  if (target) {
    // target.position.y = 0.8 * Math.sin(timestamp / 1000);
    // target.position.x = -0.8 * Math.cos(timestamp / 1000);
    // target.position.z = -0.8 * Math.cos(timestamp / 1000);
    // ik.solve();
  }
  renderer.render(scene, camera);
}
