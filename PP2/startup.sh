npm i
npx prisma generate
npx prisma migrate dev --name init
node scripts/createAdmin.js

echo "Adding current user to docker group..."
# You have to be in the docker group to run the server without sudo
sudo usermod -aG docker $USER
sudo systemctl restart docker

echo "Setup complete. You might need to restart your shell or system if docker still doesn't work."