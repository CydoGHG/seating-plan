document.addEventListener('DOMContentLoaded', function() {
    const studentForm = document.getElementById('studentForm');
    const studentInputsContainer = document.getElementById('studentInputs');
    const classroomDiv = document.getElementById('classroom');
    const studentFileInput = document.getElementById('studentFile');
    let studentCount = 0;
    let currentStudentIndex = 0;
    let students = [];
    let seats = [
        [false, true, true, true, false, true],
        [true, true, false, true, false, true],
        [false, false, true, false, true, true],
        [false, true, true, true, true, true],
        [false, false, true, true, true, true],
        [false, false, false, true, true, true],
        [false, true, true, true, true, true],
        [false, true, false, true, true, true],
        [true, true, false, true, true, true],
        [false, true, true, false, false, false],
        [true, false, true, true, false, false],
        [false, false, true, true, true, false],
        [true, true, false, true, false, false],
        [false, false, true, true, false, false],
        [false, true, false, true, false, false],
        [false, false, true, true, true, true],
        [true, false, false, true, true, true],
        [false, true, true, false, false, false],
        [true, true, false, true, true, false],
        [false, true, true, false, false, false],
        [true, false, true, false, false, false],
        [false, false, true, true, true, false],
        [true, true, false, true, true, false],
        [false, false, true, true, true, false],
        [true, true, false, false, false, false],
        [false, true, true, true, false, false],
        [true, true, false, false, false, false],
        [true, false, true, true, false, false],
        [false, false, true, true, true, false],
        [true, true, true, false, false, false],
        [true, false, true, true, false, false],
        [false, false, true, true, true, false]
    ];
    let studentSimilarity = Array.from({ length: seats.length }, () => []);

    studentFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                parseStudentData(content);
            };
            reader.readAsText(file);
        }
    });

    function parseStudentData(content) {
        const lines = content.split('\n');
        students = lines.map(line => {
            const parts = line.split(",");
            const name = parts[0];
            const friends = parts[1] ? parts[1].split(';') : [];
            const traits = parts.slice(2, 8).map(trait => trait === 'true');
            const incompatible = parts[8] ? parts[8].split(';') : [];
            return { name, friends, traits, incompatible };
        });
        studentCount = students.length;
        checkForSimilarity(students);
        const { seatedStudents, unseatedStudents } = assignSeats();
        displaySeatingStatus(seatedStudents, unseatedStudents, students);
    }

    document.getElementById('downloadStudentInfo').addEventListener('click', function() {
        downloadStudentInfo();
    });

    document.getElementById('downloadSeatingPlan').addEventListener('click', function() {
        downloadSeatingPlan();
    });

    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (studentCount === 0) {
            studentCount = parseInt(document.getElementById('studentCount').value);
            if (isNaN(studentCount) || studentCount <= 0 || studentCount > 32) {
                alert("Please enter a valid number of students (1 to 32).");
                return;
            }
            if (!confirm(`You entered ${studentCount} students. Proceed to enter student information?`)) {
                return;
            }
        }
        if (currentStudentIndex < studentCount) {
            generateStudentInputs();
            currentStudentIndex++;
        } else {
            checkForSimilarity(students);
            const { seatedStudents, unseatedStudents } = assignSeats();
            displaySeatingStatus(seatedStudents, unseatedStudents, students);
            drawClassroom(seatedStudents, classroomDiv);
        }
    });

    function generateStudentInputs() {
        studentInputsContainer.innerHTML = '';
        const studentIndex = currentStudentIndex + 1;
        const studentDiv = document.createElement('div');
        studentDiv.classList.add('student');

        const nameLabel = document.createElement('label');
        nameLabel.textContent = `Student ${studentIndex} Name:`;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `student${studentIndex}Name`;
        nameInput.name = `student${studentIndex}Name`;
        nameInput.addEventListener('input', updateStudentData);

        const friendsLabel = document.createElement('label');
        friendsLabel.textContent = `Friends (comma-separated indices):`;
        const friendsInput = document.createElement('input');
        friendsInput.type = 'text';
        friendsInput.id = `student${studentIndex}Friends`;
        friendsInput.name = `student${studentIndex}Friends`;
        friendsInput.addEventListener('input', updateStudentData);

        const traitsLabel = document.createElement('label');
        traitsLabel.textContent = `Traits:`;
        const traitsDiv = document.createElement('div');
        traitsDiv.classList.add('traits');

        const traitLabels = ['Redet', 'Stört', 'Passt Auf', 'Macht mit', 'Gut im Unterricht', 'Groß'];
        for (let j = 0; j < traitLabels.length; j++) {
            const traitLabel = document.createElement('label');
            traitLabel.classList.add('checkbox-label');
            traitLabel.textContent = traitLabels[j];
        
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add('checkbox-wrapper-63'); // Use the class from the example
        
            const switchWrapper = document.createElement('label');
            switchWrapper.classList.add('switch'); // Add the "switch" class for the outer wrapper
        
            const traitInput = document.createElement('input');
            traitInput.type = 'checkbox';
            traitInput.id = `student${studentIndex}Trait${j + 1}`;
            traitInput.name = `student${studentIndex}Trait${j + 1}`;
            traitInput.checked = false;
            traitInput.addEventListener('input', updateStudentData);
        
            const slider = document.createElement('span');
            slider.classList.add('slider'); // The slider itself
        
            // Append input and slider to the switch wrapper
            switchWrapper.appendChild(traitInput);
            switchWrapper.appendChild(slider);
        
            // Append switch wrapper to the checkbox wrapper
            checkboxWrapper.appendChild(switchWrapper);
        
            // Append the checkbox wrapper to the trait label
            traitLabel.appendChild(checkboxWrapper);
        
            // Append the label to the traitsDiv
            traitsDiv.appendChild(traitLabel);
        }
        
        
        

        const incompatibleLabel = document.createElement('label');
        incompatibleLabel.textContent = `Incompatible students (comma-separated indices):`;
        const incompatibleInput = document.createElement('input');
        incompatibleInput.type = 'text';
        incompatibleInput.id = `student${studentIndex}Incompatible`;
        incompatibleInput.name = `student${studentIndex}Incompatible`;
        incompatibleInput.addEventListener('input', updateStudentData);

        studentDiv.appendChild(nameLabel);
        studentDiv.appendChild(nameInput);
        studentDiv.appendChild(document.createElement('br'));
        studentDiv.appendChild(friendsLabel);
        studentDiv.appendChild(friendsInput);
        studentDiv.appendChild(document.createElement('br'));
        studentDiv.appendChild(traitsLabel);
        studentDiv.appendChild(traitsDiv);
        studentDiv.appendChild(document.createElement('br'));
        studentDiv.appendChild(incompatibleLabel);
        studentDiv.appendChild(incompatibleInput);
        studentInputsContainer.appendChild(studentDiv);
    }

    function updateStudentData(event) {
        const inputField = event.target;
        const studentIndex = parseInt(inputField.name.match(/\d+/)[0]);
        const fieldKey = inputField.name.replace(`student${studentIndex}`, '').toLowerCase();
        const fieldValue = inputField.type === 'checkbox' ? inputField.checked : inputField.value;
        let student = students[studentIndex - 1];
        if (!student) {
            student = { name: '', friends: [], traits: Array(6).fill(false), incompatible: [] };
            students[studentIndex - 1] = student;
        }
        if (fieldKey.startsWith('trait')) {
            const traitIndex = parseInt(fieldKey.match(/\d+/)[0]) - 1;
            student.traits[traitIndex] = fieldValue;
        } else if (fieldKey === 'friends') {
            student.friends = fieldValue.split(',').map(index => index.trim());
        } else if (fieldKey === 'incompatible') {
            student.incompatible = fieldValue.split(',').map(index => index.trim());
        } else {
            student[fieldKey] = fieldValue;
        }
    }

    function checkForSimilarity(students) {
        for (let i = 0; i < seats.length; i++) {
            for (let j = 0; j < students.length; j++) {
                let similarityCount = 0;
                for (let k = 0; k < students[j].traits.length; k++) {
                    if (students[j].traits[k] === seats[i][k]) {
                        similarityCount++;
                    }
                }
                studentSimilarity[i].push({ studentIndex: j, similarity: similarityCount });
            }
            studentSimilarity[i].sort((a, b) => b.similarity - a.similarity);
        }
    }

    function assignSeats() {
        let seatedStudents = [];
        let unseatedStudents = [];
        let availableSeats = Array.from({ length: seats.length }, (_, index) => index);

        for (let i = 0; i < students.length; i++) {
            let bestSeatIndex = findBestSeatForStudent(i, availableSeats, seatedStudents);
            if (bestSeatIndex !== -1) {
                seatedStudents.push({ studentIndex: i, student: students[i].name, seat: `Sitzplatz_${bestSeatIndex + 1}` });
                availableSeats = availableSeats.filter(index => index !== bestSeatIndex);
            } else {
                unseatedStudents.push(students[i].name);
            }
        }

        console.log("Seated Students:");
        seatedStudents.forEach(assignment => {
            console.log(`${assignment.student} assigned to ${assignment.seat}`);
        });

        console.log("Unseated Students:");
        if (Array.isArray(unseatedStudents) && unseatedStudents.length > 0) {
            unseatedStudents.forEach(student => {
                console.log(`${student} could not be seated.`);
            });
        } else {
            console.log("All students have been seated.");
        }

        const classroomDiv = document.getElementById('classroom');
        seatedStudents.forEach(assignment => {
            const seatIndex = parseInt(assignment.seat.split('_')[1]) - 1;
            const seatElement = classroomDiv.querySelector(`.seat:nth-child(${seatIndex + 1})`);
            if (seatElement) {
                seatElement.textContent = assignment.student;
                seatElement.classList.add('seat-occupied');
            }
        });

        return { seatedStudents, unseatedStudents };
    }

    function findBestSeatForStudent(studentIndex, availableSeats, seatedStudents) {
        let bestSeatIndex = -1;
        let bestSimilarity = -1;

        for (let seatIndex of availableSeats) {
            let similarity = studentSimilarity[seatIndex].find(sim => sim.studentIndex === studentIndex)?.similarity || -1;
            if (similarity > bestSimilarity && isCompatibleWithStudent(students[studentIndex], seatedStudents, seatIndex)) {
                bestSimilarity = similarity;
                bestSeatIndex = seatIndex;
            }
        }

        return bestSeatIndex;
    }

    function isCompatibleWithStudent(student, seatedStudents, seatIndex) {
        const assignedStudents = seatedStudents.map(assignment => students[assignment.studentIndex]);

        // Check for incompatibility with already seated students
        for (const assignedStudent of assignedStudents) {
            if (student.incompatible.includes(assignedStudent.name) || assignedStudent.incompatible.includes(student.name)) {
                return false;
            }
        }

        // Check for friend proximity (do not allow direct neighbors if friends)
        for (const friend of student.friends) {
            const friendIndex = parseInt(friend) - 1;
            if (friendIndex >= 0 && friendIndex < students.length) {
                const friendAssignment = seatedStudents.find(assignment => assignment.studentIndex === friendIndex);
                if (friendAssignment) {
                    const friendSeatIndex = parseInt(friendAssignment.seat.split('_')[1]) - 1;
                    if (Math.abs(friendSeatIndex - seatIndex) === 1) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    function isCompatibleWith(student1, student2) {
        // Default to true if traits are not defined
        if (!student1 || !student1.traits || !student2 || !student2.traits) {
            return true;
        }

        // Check for common traits
        for (let i = 0; i < student1.traits.length; i++) {
            if (student1.traits[i] && student2.traits[i]) {
                return true;
            }
        }
        return false;
    }

    function drawClassroom(seatedStudents, classroomDiv) {
        classroomDiv.innerHTML = '';
        const seatsPerRow = 8;
        const totalSeats = seats.length;
        const rows = Math.ceil(totalSeats / seatsPerRow);

        let seatIndex = totalSeats - 1;

        for (let row = 0; row < rows; row++) {
            for (let col = seatsPerRow - 1; col >= 0; col--) {
                if (seatIndex < 0) break;
                const seatNumber = seatIndex + 1;
                const studentAssignment = seatedStudents.find(seat => seat.seat === `Sitzplatz_${seatNumber}`);
                const seatDiv = document.createElement('div');
                seatDiv.classList.add('seat');
                seatDiv.textContent = studentAssignment ? studentAssignment.student : '';
                classroomDiv.appendChild(seatDiv);
                seatIndex--;
            }
        }
    }

    function displaySeatingStatus(seatedStudents, unseatedStudents, allStudents) {
        console.log("\nAll Students:");
        allStudents.forEach(student => {
            console.log(student);
        });

        console.log("\nSeated Students:");
        seatedStudents.forEach(assignment => {
            console.log(`${assignment.student} assigned to ${assignment.seat}`);
        });

        console.log("\nUnseated Students:");
        if (Array.isArray(unseatedStudents) && unseatedStudents.length > 0) {
            unseatedStudents.forEach(student => {
                console.log(`${student} could not be seated.`);
            });
        } else {
            console.log("All students have been seated.");
        }
    }

    function downloadStudentInfo() {
        const content = students.map(student => {
            const traits = student.traits.map(trait => trait ? 'true' : 'false').join(',');
            const friends = student.friends.join(';');
            const incompatible = student.incompatible.join(';');
            return `${student.name},${friends},${traits},${incompatible}`;
        }).join('\n');

        downloadFile(content, 'student_info.txt', 'text/plain');
    }

    function downloadSeatingPlan() {
        html2canvas(document.getElementById('classroom')).then(canvas => {
            const imageURL = canvas.toDataURL();
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'seating_plan.png';
            link.click();
        });
    }

    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    checkForSimilarity(students);
    const { seatedStudents, unseatedStudents } = assignSeats();
    displaySeatingStatus(seatedStudents, unseatedStudents, students);
    drawClassroom(seatedStudents, classroomDiv);
});
