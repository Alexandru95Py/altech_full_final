/**
 * Simple Test Page to debug routing issues
 */

const TestPage = () => {
  return (
    <div
      style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}
    >
      <h1 style={{ color: "red", fontSize: "24px" }}>
        TEST PAGE - ROUTING WORKS!
      </h1>
      <p>If you can see this page, routing is working correctly.</p>
      <p>Current URL: {window.location.href}</p>
      <p>Time: {new Date().toString()}</p>
      <div style={{ marginTop: "20px" }}>
        <a href="/" style={{ marginRight: "20px" }}>
          Go to Home
        </a>
        <a href="/tools" style={{ marginRight: "20px" }}>
          Go to Tools
        </a>
        <a href="/test">Reload Test</a>
      </div>
    </div>
  );
};

export default TestPage;
