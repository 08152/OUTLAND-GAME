
/*
========================================================
 OUTLAND - CHARACTER BASE
 Three.js | Procedural Mesh | Skeleton | Skinning
========================================================

 Datei: character.js

 Einbindung:
 <script src="character.js"></script>

 Erstellen:
 const player = createOUTLANDCharacter(scene);

 Koordinaten:
 Y = oben
 Z = vorne

 Keine Animationen enthalten.
========================================================
*/

function createOUTLANDCharacter(scene) {

    const root = new THREE.Group();
    root.name = "OUTLAND_CHARACTER";

    const model = new THREE.Group();
    model.name = "Character_Model";
    root.add(model);

    const rig = new THREE.Group();
    rig.name = "Character_Rig";
    root.add(rig);

    const material = (color, roughness = 0.8) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness
        });

    const materials = {
        skin: material(0xc58b6b),
        skinLight: material(0xd9a184),
        underwear: material(0x174c91),
        underwearDetail: material(0x59aaff),
        shoes: material(0xe87532),
        shoeSole: material(0x252a31),
        hair: material(0x38271f),
        eyes: material(0x273c32),
        eyeWhite: material(0xf4eee7)
    };


    // ====================================================
    // 1. ORGANISCHE MESH-GEOMETRIE
    // ====================================================

    function createBodyGeometry(sections, radialSegments = 48) {

        const vertices = [];
        const indices = [];

        for (let i = 0; i < sections.length; i++) {

            const section = sections[i];

            for (let j = 0; j < radialSegments; j++) {

                const angle =
                    (j / radialSegments) * Math.PI * 2;

                const x =
                    Math.cos(angle) * section.rx +
                    (section.cx || 0);

                const z =
                    Math.sin(angle) * section.rz +
                    (section.cz || 0);

                vertices.push(x, section.y, z);
            }
        }

        for (let i = 0; i < sections.length - 1; i++) {

            for (let j = 0; j < radialSegments; j++) {

                const a = i * radialSegments + j;
                const b = i * radialSegments +
                    (j + 1) % radialSegments;

                const c = (i + 1) * radialSegments + j;
                const d = (i + 1) * radialSegments +
                    (j + 1) % radialSegments;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        // Oberes und unteres Ende schließen

        const bottomCenter = vertices.length / 3;
        vertices.push(0, sections[0].y, 0);

        const topCenter = vertices.length / 3;
        vertices.push(
            0,
            sections[sections.length - 1].y,
            0
        );

        for (let j = 0; j < radialSegments; j++) {

            indices.push(
                bottomCenter,
                (j + 1) % radialSegments,
                j
            );

            const last =
                (sections.length - 1) * radialSegments;

            indices.push(
                topCenter,
                last + j,
                last + (j + 1) % radialSegments
            );
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }


    // ====================================================
    // 2. KNOCHEN
    // ====================================================

    const bones = {};

    function addBone(name, parent, position) {

        const bone = new THREE.Bone();
        bone.name = name;

        bone.position.set(
            position[0],
            position[1],
            position[2]
        );

        parent.add(bone);
        bones[name] = bone;

        return bone;
    }

    const hips = addBone(
        "Hips", rig, [0, 0.95, 0]
    );

    const spine = addBone(
        "Spine", hips, [0, 0.16, 0]
    );

    const spine1 = addBone(
        "Spine1", spine, [0, 0.23, 0]
    );

    const spine2 = addBone(
        "Spine2", spine1, [0, 0.23, 0]
    );

    const chest = addBone(
        "Chest", spine2, [0, 0.17, 0]
    );

    const neck = addBone(
        "Neck", chest, [0, 0.42, 0]
    );

    const head = addBone(
        "Head", neck, [0, 0.13, 0]
    );

    // Gesicht

    const jaw = addBone(
        "Jaw", head, [0, -0.13, 0.04]
    );

    addBone(
        "Chin", jaw, [0, -0.06, 0.02]
    );

    for (const side of ["L", "R"]) {

        const sign = side === "L" ? -1 : 1;

        addBone(
            "Eye_" + side,
            head,
            [sign * 0.105, 0.06, 0.19]
        );

        addBone(
            "Eyebrow_" + side,
            head,
            [sign * 0.105, 0.13, 0.17]
        );

        addBone(
            "Cheek_" + side,
            head,
            [sign * 0.15, -0.03, 0.13]
        );
    }

    addBone(
        "UpperLip", head, [0, -0.07, 0.2]
    );

    addBone(
        "LowerLip", jaw, [0, 0.04, 0.12]
    );


    // Arme und Finger

    function createArm(side, suffix) {

        const shoulder = addBone(
            "Shoulder_" + suffix,
            chest,
            [side * 0.40, 0.28, 0]
        );

        const upperArm = addBone(
            "UpperArm_" + suffix,
            shoulder,
            [side * 0.08, -0.10, 0]
        );

        const forearm = addBone(
            "Forearm_" + suffix,
            upperArm,
            [0, -0.32, 0]
        );

        const hand = addBone(
            "Hand_" + suffix,
            forearm,
            [0, -0.29, 0]
        );

        const palm = addBone(
            "Palm_" + suffix,
            hand,
            [0, -0.04, 0]
        );

        const fingerNames = [
            "Index", "Middle", "Ring", "Pinky"
        ];

        const fingerOffsets = [
            -0.072, -0.024, 0.024, 0.072
        ];

        fingerNames.forEach((finger, index) => {

            let parent = palm;

            for (let joint = 1; joint <= 3; joint++) {

                parent = addBone(
                    finger + "_" + suffix + "_" + joint,
                    parent,
                    [
                        joint === 1
                            ? fingerOffsets[index] * side
                            : 0,
                        -0.045,
                        0
                    ]
                );
            }
        });

        let thumb = palm;

        for (let joint = 1; joint <= 3; joint++) {

            thumb = addBone(
                "Thumb_" + suffix + "_" + joint,
                thumb,
                [
                    joint === 1 ? side * 0.09 : 0,
                    -0.025,
                    joint === 1 ? 0.025 : 0
                ]
            );
        }
    }

    createArm(-1, "L");
    createArm(1, "R");


    // Beine

    function createLeg(side, suffix) {

        const upper = addBone(
            "UpperLeg_" + suffix,
            hips,
            [side * 0.19, -0.08, 0]
        );

        const lower = addBone(
            "LowerLeg_" + suffix,
            upper,
            [0, -0.45, 0]
        );

        const foot = addBone(
            "Foot_" + suffix,
            lower,
            [0, -0.43, 0]
        );

        addBone(
            "Toe_" + suffix,
            foot,
            [0, -0.02, 0.14]
        );
    }

    createLeg(-1, "L");
    createLeg(1, "R");


    // ====================================================
    // 3. SKINNED BODY
    // ====================================================

    const bodySections = [
        { y: 0.90, rx: 0.25, rz: 0.15 },
        { y: 1.00, rx: 0.32, rz: 0.19 },
        { y: 1.15, rx: 0.34, rz: 0.20 },
        { y: 1.30, rx: 0.31, rz: 0.19 },
        { y: 1.45, rx: 0.34, rz: 0.20 },
        { y: 1.60, rx: 0.39, rz: 0.22 },
        { y: 1.75, rx: 0.43, rz: 0.23 },
        { y: 1.90, rx: 0.41, rz: 0.22 },
        { y: 2.00, rx: 0.30, rz: 0.17 }
    ];

    const bodyGeometry = createBodyGeometry(
        bodySections,
        64
    );

    // Jedes Vertex bekommt Gewichte für die
    // nächstgelegenen Bones.

    function skinGeometry(geometry, boneList, skeleton) {

        const positions =
            geometry.attributes.position;

        const skinIndices = [];
        const skinWeights = [];

        const bindMatrix = new THREE.Matrix4();

        for (let i = 0; i < positions.count; i++) {

            const vertex = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );

            const y = vertex.y;

            let primary = "Hips";
            let secondary = "Spine";
            let blend = 0;

            if (y < 1.12) {
                primary = "Hips";
                secondary = "UpperLeg_L";
                blend = Math.max(0, (1.12 - y) * 0.5);
            }
            else if (y < 1.35) {
                primary = "Hips";
                secondary = "Spine";
                blend = (y - 1.12) / 0.23;
            }
            else if (y < 1.65) {
                primary = "Spine1";
                secondary = "Spine2";
                blend = (y - 1.35) / 0.30;
            }
            else {
                primary = "Spine2";
                secondary = "Chest";
                blend = Math.min(1, (y - 1.65) / 0.35);
            }

            const boneA = boneList.findIndex(
                bone => bone.name === primary
            );

            const boneB = boneList.findIndex(
                bone => bone.name === secondary
            );

            skinIndices.push(
                boneA, boneB, 0, 0
            );

            skinWeights.push(
                1 - blend, blend, 0, 0
            );
        }

        geometry.setAttribute(
            "skinIndex",
            new THREE.Uint16BufferAttribute(
                skinIndices, 4
            )
        );

        geometry.setAttribute(
            "skinWeight",
            new THREE.Float32BufferAttribute(
                skinWeights, 4
            )
        );
    }

    const boneList = Object.values(bones);

    skinGeometry(
        bodyGeometry,
        boneList
    );

    const body = new THREE.SkinnedMesh(
        bodyGeometry,
        materials.skin
    );

    body.name = "Body_Mesh";
    body.castShadow = true;
    body.receiveShadow = true;

    model.add(body);

    // Skelett an das Mesh binden

    const skeleton = new THREE.Skeleton(boneList);

    body.add(rig);
    body.bind(skeleton);


    // ====================================================
    // 4. UNTERHOSE
    // ====================================================

    const underwear = new THREE.Mesh(
        createBodyGeometry([
            { y: 0.88, rx: 0.25, rz: 0.16 },
            { y: 0.94, rx: 0.33, rz: 0.21 },
            { y: 1.02, rx: 0.36, rz: 0.22 },
            { y: 1.12, rx: 0.35, rz: 0.21 },
            { y: 1.18, rx: 0.30, rz: 0.18 }
        ], 64),
        materials.underwear
    );

    underwear.name = "Underwear";
    underwear.castShadow = true;
    underwear.receiveShadow = true;

    model.add(underwear);


    // ====================================================
    // 5. KOPF UND GESICHT
    // ====================================================

    function addSphere(parent, name, material, position, scale) {

        const geometry = new THREE.SphereGeometry(
            1, 48, 32
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.name = name;

        mesh.position.set(...position);
        mesh.scale.set(...scale);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    }

    const headGroup = new THREE.Group();
    headGroup.name = "Head_Model";
    head.add(headGroup);

    addSphere(
        headGroup,
        "Head_Sculpt",
        materials.skin,
        [0, 0.12, 0],
        [0.25, 0.34, 0.22]
    );

    addSphere(
        headGroup,
        "Jaw_Sculpt",
        materials.skin,
        [0, -0.12, 0.09],
        [0.18, 0.13, 0.14]
    );

    addSphere(
        headGroup,
        "Nose",
        materials.skinLight,
        [0, 0.02, 0.205],
        [0.055, 0.085, 0.065]
    );

    for (const side of [-1, 1]) {

        addSphere(
            headGroup,
            "Ear",
            materials.skin,
            [side * 0.25, 0.12, 0],
            [0.06, 0.10, 0.07]
        );

        addSphere(
            headGroup,
            "Eye_White",
            materials.eyeWhite,
            [side * 0.10, 0.08, 0.19],
            [0.062, 0.042, 0.025]
        );

        addSphere(
            headGroup,
            "Eye_Iris",
            materials.eyes,
            [side * 0.10, 0.08, 0.213],
            [0.027, 0.029, 0.012]
        );

        addSphere(
            headGroup,
            "Hair",
            materials.hair,
            [side * 0.11, 0.36, -0.015],
            [0.14, 0.09, 0.19]
        );
    }


    // ====================================================
    // 6. SCHUHE
    // ====================================================

    function createShoe(side) {

        const group = new THREE.Group();

        group.name = side < 0
            ? "Shoe_L"
            : "Shoe_R";

        group.position.set(
            side * 0.19,
            0.05,
            0
        );

        model.add(group);

        addSphere(
            group,
            "Shoe_Sole",
            materials.shoeSole,
            [0, 0, 0.07],
            [0.14, 0.055, 0.24]
        );

        addSphere(
            group,
            "Shoe_Upper",
            materials.shoes,
            [0, 0.09, 0.04],
            [0.125, 0.11, 0.20]
        );

        addSphere(
            group,
            "Shoe_Tongue",
            materials.shoeDetail,
            [0, 0.16, 0.10],
            [0.065, 0.025, 0.10]
        );
    }

    createShoe(-1);
    createShoe(1);


    // ====================================================
    // 7. AUSGABE
    // ====================================================

    scene.add(root);

    return {
        root,
        model,
        rig,
        body,
        skeleton,
        bones,
        materials,

        getBone(name) {
            return bones[name] || null;
        },

        getBoneNames() {
            return Object.keys(bones);
        }
    };
}
