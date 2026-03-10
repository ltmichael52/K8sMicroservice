pipeline {
agent any

```
environment {
    DOCKER_REPO = "lemichael52"
    IMAGE_TAG = "${env.BUILD_NUMBER}"

    DOCKER_CREDENTIALS = "docker-hub"

    GCP_PROJECT = "your-gcp-project-id"
    GKE_CLUSTER = "k8sbe"
    GKE_ZONE = "asia-east1"
}

stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Detect Branch') {
        steps {
            script {
                echo "Building branch: ${env.BRANCH_NAME}"
            }
        }
    }

    stage('Detect Changes') {
        steps {
            script {
                CHANGED_FILES = sh(
                    script: "git diff --name-only HEAD~1 HEAD",
                    returnStdout: true
                ).trim()

                echo "Changed files: ${CHANGED_FILES}"
            }
        }
    }

    stage('Authenticate GKE') {
        steps {
            withCredentials([file(credentialsId: 'gke-service-account', variable: 'GOOGLE_KEY')]) {
                sh '''
                gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                gcloud config set project $GCP_PROJECT

                gcloud container clusters get-credentials $GKE_CLUSTER \
                    --region $GKE_ZONE \
                    --project $GCP_PROJECT
                '''
            }
        }
    }

    stage('Build & Push User Service') {
        when {
            expression { CHANGED_FILES.contains("user-service") }
        }
        steps {
            script {
                docker.withRegistry('', DOCKER_CREDENTIALS) {
                    sh """
                    docker build -t $DOCKER_REPO/user-service:$IMAGE_TAG ./user-service
                    docker push $DOCKER_REPO/user-service:$IMAGE_TAG
                    """
                }
            }
        }
    }

    stage('Deploy User Service') {
        when {
            allOf {
                branch 'main'
                expression { CHANGED_FILES.contains("user-service") }
            }
        }
        steps {
            sh """
            kubectl set image deployment/user-service \
            user-service=$DOCKER_REPO/user-service:$IMAGE_TAG
            """
        }
    }

    stage('Build & Push Task Service') {
        when {
            expression { CHANGED_FILES.contains("task-service") }
        }
        steps {
            script {
                docker.withRegistry('', DOCKER_CREDENTIALS) {
                    sh """
                    docker build -t $DOCKER_REPO/task-service:$IMAGE_TAG ./task-service
                    docker push $DOCKER_REPO/task-service:$IMAGE_TAG
                    """
                }
            }
        }
    }

    stage('Deploy Task Service') {
        when {
            allOf {
                branch 'main'
                expression { CHANGED_FILES.contains("task-service") }
            }
        }
        steps {
            sh """
            kubectl set image deployment/task-service \
            task-service=$DOCKER_REPO/task-service:$IMAGE_TAG
            """
        }
    }

}
```

}
