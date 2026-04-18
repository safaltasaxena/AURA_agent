const { VertexAI } = require("@google-cloud/vertexai");

const PROJECT_ID = "my-project-stadium-493709";

const vertexAI = new VertexAI({
    project: PROJECT_ID,
    location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
    model: "gemini-1.5-flash", // ✅ FIXED
});

async function testAI() {
    try {
        const result = await model.generateContent("Say hello in one short line");
        const text = result.response.text();
        console.log("✅ AI working:", text);
    } catch (error) {
        console.error("❌ AI error:", error);
    }
}

testAI();