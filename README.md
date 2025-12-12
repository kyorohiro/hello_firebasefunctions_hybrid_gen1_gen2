firebase deploy --only "functions:gen1:helloV1"
firebase deploy --only "functions:gen2:helloV2"

gcloud auth login
gcloud config set project hello-funcs-v1v2

gcloud functions add-iam-policy-binding helloV1 \
  --region=asia-northeast1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"