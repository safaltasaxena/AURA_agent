const { VertexAI } = require("@google-cloud/vertexai");

const vertexAI = new VertexAI({
    project: "my-project-stadium-493709",
    location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

async function testAI() {
    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "Say hello in one line" }] }],
        });

        const text = result.response.candidates[0].content.parts[0].text;
        console.log("✅ AI working:", text);
    } catch (error) {
        console.error("❌ AI error:", error);
    }
}

testAI();