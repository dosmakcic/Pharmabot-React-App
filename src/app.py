from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import json
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

with open('problems.json', 'r') as f:
    dataset = json.load(f)

X_train = []
y_train = []
for category, sentences in dataset.items():
    X_train.extend(sentences)
    y_train.extend([category] * len(sentences))

model = make_pipeline(CountVectorizer(), LogisticRegression())
model.fit(X_train, y_train)

def predict_category(text, model):
    return model.predict([text])[0]

def levenshtein_distance(s1, s2):
    len_s1 = len(s1)
    len_s2 = len(s2)
    matrix = [[0] * (len_s2 + 1) for _ in range(len_s1 + 1)]
    for i in range(len_s1 + 1):
        matrix[i][0] = i
    for j in range(len_s2 + 1):
        matrix[0][j] = j
    for i in range(1, len_s1 + 1):
        for j in range(1, len_s2 + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            matrix[i][j] = min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    return matrix[len_s1][len_s2]

allergies = [
    "Paracetamol", "Kofein", "Naproksen", "Natrijev alginat", "Natrijev hidrogenkarbonat",
    "Bršljan", "Pantoprazol", "Lopermamid klorid", "Peruanski balzam", "Levomentol",
    "Loperamid klorid", "Simetikon", "Bromheksin klorid", "Metilparahidroksibezoat",
    "Islandski lišaj", "Kukuruzni škrob", "Ibuprofen", "Minoksidil", "Natrijev škroboglikolat",
    "Manitol", "Oksimetazolin klorid", "Tetrizolin klorid", "Orlistat", "Desloratadin",
    "Loratidin", "Ulipristal acetat", "Heksetidin", "Heparin", "Tirotricin", "Sabal",
    "Flurbiprofen", "Diklofenak natrij", "Ksilometazolin klorid", "Linex Baby prašak",
    "Lizozim klorid piridoksinklorid", "Kamilica", "Dimenhidrinat", "Aciklovir", "Glicerol",
    "Klorheksidindiklorid lidokainklorid", "Đumbir", "Klotrimazol", "Nikotin"
]

def closest_allergy(word, allergies):
    smallest_distance = float('inf')
    closest_allergy = None
    for allergy in allergies:
        distance = levenshtein_distance(word, allergy)
        if distance < smallest_distance:
            smallest_distance = distance
            closest_allergy = allergy
    word_length = max(len(word), len(closest_allergy))
    similarity_percentage = 1 - (smallest_distance / word_length)
    return closest_allergy, similarity_percentage

def analyze_allergies(sentence, allergies):
    sentence_words = sentence.split()
    results = {}
    for word in sentence_words:
        closest = closest_allergy(word, allergies)
        results[word] = closest
    return results

def find_medicines_by_symptom_and_allergies(medicine_database, symptom, allergies, pregnancy, age):
    appropriate_medicines = []
    for medicine in medicine_database["medicines"]:
        if symptom in medicine["problems"]:
            if pregnancy == "Ne" or (pregnancy == "Da" and medicine["pregnancy"] == "Da"):
                if not any(allergy in medicine["allergies"] for allergy in allergies):
                    if age is None or medicine["minimum_age"] <= age:
                        appropriate_medicines.append(medicine)
    return appropriate_medicines

@app.route('/process', methods=['POST'])
def process_strings():
    data = request.json
    responses = data.get('responses', [])
    
    if not data:
        return jsonify({'error': 'Invalid JSON sent or no JSON received'}), 400
    responses = data.get('responses', [])
    if len(responses) < 4:
        return jsonify({'error': 'Please provide all four responses.'}), 400
   
    user_problem = responses[0]
    predicted_problem = predict_category(user_problem, model)
    user_year = responses[1]

    try:
        year = int(user_year)
    except ValueError:
        year = None
    results = analyze_allergies(responses[2], allergies)
    extracted_allergies = [allergy for word, (allergy, percentage) in results.items() if percentage >= 0.6]
    user_pregnancy = responses[3]
    predicted_pregnancy = predict_category(user_pregnancy, model)

    with open("medicines.json", "r", encoding="utf-8") as file:
        medicine_database = json.load(file)
    appropriate_medicines = find_medicines_by_symptom_and_allergies(medicine_database, predicted_problem, extracted_allergies, predicted_pregnancy,
     year)
    response_medicines = "\n".join(medicine["name"] for medicine in appropriate_medicines)
    
    return jsonify({'appropriate_medicines': response_medicines})

if __name__ == '__main__':
    app.run(debug=True)
