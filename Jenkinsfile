pipeline {
    agent any

    environment {
        DOCKER_REPO = "lemichael52"
        IMAGE_TAG = "${env.BUILD_NUMBER}"

        DOCKER_CREDENTIALS = "docker-hub"

        GCP_PROJECT = "serious-hold-451015-e5"
        GKE_CLUSTER = "k8sbe"
        GKE_ZONE = "asia-east1"
    }

    stages {

        stage('Check DockerHub Connection') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "Testing DockerHub login..."

                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    echo "Docker login successful"

                    docker info | grep Username || true
                    '''
                }
            }
        }
        
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

        stage('Build User Service') {
            when {
                expression { CHANGED_FILES.contains("user-service") }
            }
            steps {
                sh """
                docker build -t $DOCKER_REPO/user-service:$IMAGE_TAG ./user-service
                docker push $DOCKER_REPO/user-service:$IMAGE_TAG
                """
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

    }
}