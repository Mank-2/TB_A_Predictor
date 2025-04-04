// Initialize modal identifiers.
var modal = document.getElementById("modalbox");
var span = document.getElementsByClassName("close")[0];
var resultKeys = new Map([
    ['tb', 'Tuberculosis'],
    ['asthma', 'Asthma'],
    ['no_disease', 'No disease'],
 ]);


async function loadPyodideAndPackages() {
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
        
        document.getElementById('modaltext').insertAdjacentHTML('afterend', '<p id="remove">Please enter a valid age between 0 and 120.<p id="remove">')

        message = document.getElementById("remove")

        return "User did not set age."
    };

    let prediction = await pyodide.runPythonAsync(`predict_health_condition(${JSON.stringify(user_data)})`);

    modal.style.display = "flex";

    if (prediction == "asthma") {
        document.getElementById('modaltext').insertAdjacentHTML('afterend', 
            `<p id="remove">
                Predicted Condition: ${resultKeys.get(prediction)}.<br>
                <br>
                Looks like you might have asthma.<br>
                <br>
                What is Asthma?<br>
                Asthma is a chronic respiratory condition that causes inflammation and narrowing of the airways,<br>
                leading to symptoms like wheezing, coughing, shortness of breath, and chest tightness.<br>
                <br>
                Key Facts:<br>
                - Asthma affects over 260 million people worldwide (WHO, 2023).<br>
                - Common triggers include allergens, pollution, cold air, and exercise.<br>
                - Asthma is manageable with proper treatment, such as inhalers and avoiding triggers.<br>
                <br>
                What You Should Do:<br>
                - Consult a healthcare professional for a detailed diagnosis.<br>
                - Use prescribed inhalers or medications as directed.<br>
                - Avoid known triggers and monitor your symptoms.<br>
                <br>
                This AI model only provides preliminary insight into asthma but is not a substitute<br>
                for professional medical diagnosis. Always consult a healthcare provider for accurate evaluation<br>
                and diagnosis.
            </p>`
        );
    } else if (prediction == "tb") {
        document.getElementById('modaltext').insertAdjacentHTML('afterend', 
            `<p id="remove">
                Predicted Condition: ${resultKeys.get(prediction)}.<br>
                <br>
                Looks like you might have tuberculosis (TB).<br>
                <br>
                What is Tuberculosis (TB)?<br>
                TB is an infectious disease caused by the bacterium Mycobacterium tuberculosis.<br>
                It primarily affects the lungs but can also impact other parts of the body.<br>
                <br>
                Key Facts:<br>
                - TB is one of the top 10 causes of death worldwide (WHO, 2023).<br>
                - Symptoms include persistent cough, fever, night sweats, and weight loss.<br>
                - TB is curable with a 6-9 month course of antibiotics.<br>
                <br>
                What You Should Do:<br>
                - Visit a healthcare provider immediately for a TB test (e.g., sputum test or chest X-ray).<br>
                - If diagnosed, follow the full course of treatment to prevent drug-resistant TB.<br>
                - Practice good hygiene, such as covering your mouth when coughing.<br>
                <br>
                This AI model only provides preliminary insight into tuberculosis but is not a substitute<br>
                for professional medical diagnosis. Always consult a healthcare provider for accurate evaluation<br>
                and diagnosis.
            </p>`
        );
    } else {
        document.getElementById('modaltext').insertAdjacentHTML('afterend', 
            `<p id="remove">
                Predicted Condition: ${resultKeys.get(prediction)}.<br>
                <br>
                Looks like you do not have asthma or tuberculosis.<br>
                <br>
                What Could It Be?<br>
                Your symptoms do not strongly indicate asthma or TB. However, you may be experiencing a mild respiratory infection, <br>
                allergies, or another condition.<br>
                <br>
                What You Should Do:<br>
                - Monitor your symptoms and rest.<br>
                - If symptoms persist or worsen, consult a healthcare professional.<br>
                - Stay hydrated and avoid irritants like smoke or pollution.<br>
                <br>
                This AI model only provides preliminary insight into tuberculosis and asthma but is not a substitute<br>
                for professional medical diagnosis. Always consult a healthcare provider for accurate evaluation<br>
                and diagnosis.
            </p>`
        );
    }

    message = document.getElementById("remove")
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
    message.remove();
    resetAllInputs();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        // Empty out modal box.
        message.remove();
        resetAllInputs();
    }
}
