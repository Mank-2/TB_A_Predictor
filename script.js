// Initialize modal identifiers.
var modal = document.getElementById("modalbox");
var span = document.getElementsByClassName("close")[0];
let loadingItem = document.getElementById("loading2");
var resultKeys = new Map([
    ['tb', 'Tuberculosis'],
    ['asthma', 'Asthma'],
    ['no_disease', 'No disease'],
 ]);


async function loadPyodideAndPackages() {
    document.getElementById("text-container").innerHTML = "";
    // Show loading screen.
    document.getElementById("loading").style.display = "flex";

    while (typeof loadPyodide === "undefined") {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    window.pyodide = await loadPyodide();
    
    let packages = pyodide.loadPackage(["pandas", "scikit-learn"]);

    await packages;

    // Run Python code.
    await pyodide.runPythonAsync(`
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        
        data = {
            'age': [25, 30, 45, 50, 15, 60, 35, 40, 55, 20, 28, 65, 70, 22, 33, 42, 38, 27, 58, 47],
            'cough': [1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            'fever': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'shortness_of_breath': [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
            'wheezing': [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
            'weight_loss': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'chest_pain': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'fatigue': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'sore_throat': [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            'night_sweats': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'loss_of_appetite': [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0],
            'diagnosis': [
                'asthma', 'asthma', 'tb', 'tb', 'asthma', 'tb', 'no_disease', 'asthma', 'tb', 'no_disease',
                'asthma', 'tb', 'tb', 'no_disease', 'asthma', 'tb', 'no_disease', 'asthma', 'tb', 'no_disease'
            ]
        }
        df = pd.DataFrame(data)
        X = df.drop('diagnosis', axis=1)
        y = df['diagnosis']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=50)
        model.fit(X_train, y_train)
        feature_names = X.columns.tolist()

        def predict_health_condition(user_data):
            user_df = pd.DataFrame([user_data], columns=feature_names)
            if sum(list(user_data.values())[1:]) < 3:
                return 'no_disease'
            else:
                return model.predict(user_df)[0]
    `);

    // Remove loading screen.
    document.getElementById("loading").style.display = "none";
}

async function predict() {
    document.getElementById("text-container").innerHTML = "";
    let user_data = {
        'age': parseInt(document.getElementById('age').value),
        'cough': document.getElementById('cough').checked ? 1 : 0,
        'fever': document.getElementById('fever').checked ? 1 : 0,
        'shortness_of_breath': document.getElementById('shortness_of_breath').checked ? 1 : 0,
        'wheezing': document.getElementById('wheezing').checked ? 1 : 0,
        'weight_loss': document.getElementById('weight_loss').checked ? 1 : 0,
        'chest_pain': document.getElementById('chest_pain').checked ? 1 : 0,
        'fatigue': document.getElementById('fatigue').checked ? 1 : 0,
        'sore_throat': document.getElementById('sore_throat').checked ? 1 : 0,
        'night_sweats': document.getElementById('night_sweats').checked ? 1 : 0,
        'loss_of_appetite': document.getElementById('loss_of_appetite').checked ? 1 : 0,
    };

    if (isNaN(user_data.age) || user_data.age < 0 || user_data.age > 120) {
        modal.style.display = "flex";
        
        document.getElementById('text-container').insertAdjacentHTML('beforeend', '<p id="remove">Please enter a valid age between 0 and 120.<p id="remove">')

        return "User did not set age."
    };

    loadingItem.style.display = "flex";
    await new Promise(resolve => setTimeout(resolve, 3000));
    loadingItem.style.display = "none";

    let prediction = await pyodide.runPythonAsync(`predict_health_condition(${JSON.stringify(user_data)})`);

    modal.style.display = "flex";

    if (prediction == "asthma") {
        document.getElementById('text-container').insertAdjacentHTML('beforeend', 
            `<div id="remove">
                Predicted Condition: <b>${resultKeys.get(prediction)}</b>.<br>
                <br>
                <b>Looks like you might have asthma.</b><br>
                <br>
                <b>What is Asthma?</b><br>
                Asthma is a chronic respiratory condition that causes inflammation and narrowing of the airways, 
                leading to symptoms like wheezing, coughing, shortness of breath, and chest tightness.
                <br><br>
                <b>Key Facts:</b><ul>
                    <li>Asthma affects over 260 million people worldwide (WHO, 2023).</li>
                    <li>Common triggers include allergens, pollution, cold air, and exercise.</li>
                    <li>Asthma can be effectively managed with the right treatment, including inhalers and avoiding triggers.</li>
                </ul>
                <b>What You Should Do:</b><ul>
                    <li>Consult a healthcare professional for a detailed diagnosis.</li>
                    <li>Use prescribed inhalers or medications as directed.</li>
                    <li>Avoid known triggers and monitor your symptoms.</li>
                </ul>
                <i>This AI model only provides preliminary insight into asthma and does not act as a substitute. 
                Always consult a healthcare provider for accurate evaluation and diagnosis.</i>
            </div>`
        );
    } else if (prediction == "tb") {
        document.getElementById('text-container').insertAdjacentHTML('beforeend', 
            `<div id="remove">
                Predicted Condition: <b>${resultKeys.get(prediction)}</b>.<br>
                <br>
                <b>Looks like you might have tuberculosis.</b><br>
                <br>
                <b>What is Tuberculosis (TB)?</b><br>
                TB is an infectious disease caused by the bacterium Mycobacterium tuberculosis. 
                 It primarily affects the lungs but can also impact other parts of the body.<br>
                <br>
                <b>Key Facts:</b><ul>
                    <li>Tuberculosis is one of the top 10 causes of death worldwide (WHO, 2023).</li>
                    <li>Symptoms include persistent cough, fever, night sweats, and weight loss.</li>
                    <li>Tuberculosis is curable in a six-to-nine-month course of antibiotics.</li>
                </ul>
                <b>What You Should Do:</b><ul>
                    <li>Visit a healthcare provider immediately for a TB test (e.g., sputum test or chest X-ray).</li>
                    <li>If diagnosed, follow the full course of treatment to prevent drug-resistant TB.</li>
                    <li>Practice good hygiene, such as covering your mouth when coughing.</li>
                </ul>
                <i>This AI model only provides preliminary insight into tuberculosis and does not act as a substitute. 
                Always consult a healthcare provider for accurate evaluation and diagnosis.</i>
            </div>`
        );
    } else {
        document.getElementById('text-container').insertAdjacentHTML('beforeend', 
            `<div id="remove">
                Predicted Condition: <b>${resultKeys.get(prediction)}</b>.<br>
                <br>
                <b>Looks like you do not have asthma or tuberculosis.</b><br>
                <br>
                <b>What Could It Be?</b><br>
                Your symptoms do not strongly indicate asthma or TB. However, you may be experiencing a mild respiratory infection,
                allergies, or another condition.<br>
                <br>
                <b>What You Should Do:</b><ul>
                    <li>Monitor your symptoms and rest.</li>
                    <li>If symptoms persist or worsen, consult a healthcare professional.</li>
                    <li>Stay hydrated and avoid irritants like smoke or pollution.</li>
                </ul>
                <i>This AI model only provides preliminary insight into asthma and tuberculosis and does not act as a substitute. 
                Always consult a healthcare provider for accurate evaluation and diagnosis.</i>
            </div>`
        );
    }
}

loadPyodideAndPackages();

// Reset all input elements.
function resetAllInputs() {
    document.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = false;
        } else {
            element.value = '';
        }
    });
}

// Modal event listeners.
span.onclick = function() {
    modal.style.display = "none";
    // Empty out modal box.
    document.getElementById("text-container").innerHTML = "";
    resetAllInputs();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        // Empty out modal box.
        document.getElementById("text-container").innerHTML = "";
        resetAllInputs();
    }
}
