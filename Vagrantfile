# -*- mode: ruby -*-
# vi: set ft=ruby :

# The most common configuration options are documented and commented below.
# For a complete reference, please see the online documentation at
# https://docs.vagrantup.com.

Vagrant.configure(2) do |config|

  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.auto_update = false
  end

  BOX = "treehouses/buster64"
  BOX_VERSION = "0.13.3"

  # planetlearingelopment VM
  config.vm.define "planetlearing" do |planetlearing|
    planetlearing.vm.box = BOX
    planetlearing.vm.box_version = BOX_VERSION

    planetlearing.vm.hostname = "planetlearing"

    planetlearing.vm.provider "virtualbox" do |vb|
      vb.name = "planetlearing"
    end

    planetlearing.vm.provider "virtualbox" do |vb|
      vb.memory = "1111"
    end

    # Port expose for planetlearing server (5984:2200 = CouchDB 3000:3000 = App)
    planetlearing.vm.network "forwarded_port", guest: 5984, host: 5200, auto_correct: true
    planetlearing.vm.network "forwarded_port", guest: 4200, host: 5000, auto_correct: true    
    planetlearing.vm.network "forwarded_port", guest: 22, host: 5222, host_ip: "0.0.0.0", id: "ssh", auto_correct: true

    # Prevent TTY Errors (copied from laravel/homestead: "homestead.rb" file)... By default this is "bash -l".
    planetlearing.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"

    planetlearing.vm.provision "shell", inline: <<-SHELL
      # Add CouchDB Docker
      sudo docker run -d -p 5984:5984 --name planet \
        -v /srv/planetlearning/conf:/opt/couchdb/etc/local.d \
        -v /srv/planetlearning/data:/opt/couchdb/data \
        -v /srv/planetlearning/log:/opt/couchdb/var/log/ \
        treehouses/couchdb:2.3.1

      # Add CORS to CouchDB so app has access to databases
      #git clone https://github.com/pouchdb/add-cors-to-couchdb.git
      #cd add-cors-to-couchdb
      #npm install
      cd add-cors-to-couchdb
      while ! curl -X GET http://127.0.0.1:5984/_all_dbs ; do sleep 1; done
      node bin.js http://localhost:5984
      cd /vagrant
      # End add CORS to CouchDB

      curl -X PUT http://localhost:5984/_node/nonode@nohost/_config/log/file -d '"/opt/couchdb/var/log/couch.log"'
      curl -X PUT http://localhost:5984/_node/nonode@nohost/_config/log/writer -d '"file"'
      curl -X PUT http://localhost:5984/_node/nonode@nohost/_config/chttpd/authentication_handlers -d '"{chttpd_auth, cookie_authentication_handler}, {chttpd_auth, proxy_authentication_handler}, {chttpd_auth, default_authentication_handler}"'

      docker restart planet

      # node_modules folder breaks when setting up in Windows, so use binding to fix
      #echo "Preparing local node_modules folder…"
      #mkdir -p /vagrant_node_modules
      mkdir -p /vagrant/node_modules
      chown vagrant:vagrant /vagrant_node_modules
      mount --bind /vagrant_node_modules /vagrant/node_modules
      npm i --unsafe-perm
      #sudo npm run webdriver-set-version
      # End node_modules fix

      # Add initial Couch databases here
      chmod +x couchdb-setup.sh
      . couchdb-setup.sh -p 5984 -i
      # End Couch database addition
    SHELL

    # Run binding on each startup make sure the mount is available on VM restart
    planetlearing.vm.provision "shell", run: "always", inline: <<-SHELL
      mount --bind /vagrant_node_modules /vagrant/node_modules
      # Starts the app in a screen (virtual terminal)
      sudo -u vagrant screen -dmS build bash -c 'cd /vagrant; ng serve --host=0.0.0.0 --poll=2000'
    SHELL
  end

end
