# Privacy Policy

WaterMirror sends water quality data to the backend configured by the user.
This document describes the current application's data handling and the
unmodified [WQSurrogateModels](https://github.com/KageRyo/WQSurrogateModels)
backend. Deployment-specific practices depend on the backend operator.

## Data Sent to the Backend

- Manual assessments send `DO`, `BOD`, `NH3N`, `EC`, `SS`, and the selected `model_type` as JSON.
- CSV assessments upload the selected file, including its contents and filename, with the selected `model_type`. The entire file is sent, including any additional columns.
- The result screen sends the assessment score as a query parameter to retrieve its percentile.
- Connection checks and supporting requests retrieve health, readiness, and category information.

These requests go to the configured backend. Avoid including personal or
sensitive information in uploaded files.

## Local Storage

WaterMirror uses device storage (`AsyncStorage`) to retain:

- the saved backend URL
- the selected language
- the current manual input values and returned assessment result when the user chooses to view a report after a successful assessment, including a CSV assessment

Saved inputs and results can be loaded again in later sessions. The **Clear**
button clears the visible input fields; it does not delete stored data.
The file picker also copies selected uploads to the device's cache directory.
Clearing application data through device settings, where supported, removes
the app's local data; it does not delete the original CSV or backend logs.

## Backend Processing and Logs

The unmodified WQSurrogateModels application logic processes assessment inputs
and uploaded CSV content to produce results. It does not persist those inputs
or CSV contents in an application database or retained assessment file.
Upload handling may use temporary files managed by the web framework; this is
not a guarantee that data never touches disk.

The backend emits operational/request metadata such as timestamps, request IDs,
HTTP methods, routes, status codes, latency, model types, and error codes.
Its structured request logging does not include assessment request bodies or
CSV contents. Other application errors may produce diagnostic logs.

Hosting infrastructure, web servers, and reverse proxies may maintain their
own access logs, including IP addresses and request URLs. URLs may include the
score used for percentile requests. Log retention and deletion depend on the
deployment operator.

## Custom and Third-Party Backends

WaterMirror allows users to configure their own backend URL. Third-party or
modified backends may store, log, or otherwise process submitted data
differently. Their operators determine those practices; this document does
not guarantee their behavior. Contact the operator for deployment-specific
privacy, retention, or deletion questions.

## Transport Security

Use HTTPS for backend connections, especially for public services. HTTP
connections are unencrypted and may expose submitted measurements, uploaded
files, and returned results to others on the network.

## Questions and Updates

For questions about WaterMirror's application behavior, contact the
[repository owner](https://github.com/KageRyo). Do not include personal data or
private assessment files in public issues. This document should be updated
when the application's data handling changes.
