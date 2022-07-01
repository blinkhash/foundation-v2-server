Setting up SSL/TLS Support
=============
Foundation supports and implements secure communication to connected miners. This guide will help you to create a self-signed key/certificate pair using openssl, which can be used to leverage these features.

Creating the Configuration File
--------------------
The first step you'll want to take when generating your self-signed certificate is creating a configuration file:

```
touch config.cnf
nano config.cnf
```

Enter the following information:

```
[req]
default_bits = 4096
distinguished_name = req_distinguished_name
req_extensions = req_ext
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = Your Country Name
ST = Your State
L = Your Location
O = Your Org Name
OU = Your Org Unit
CN = Host IP

[req_ext]
subjectAltName = @alt_names

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1  = IP of your 1st server
DNS.1 = Hostname of your 2nd server
DNS.2 = Hostname of your 3rd server
DNS.3 = Hostname of your 4th server
```

Make sure to modify each line to suit your needs. You can use either the `IP.x` or the `DNS.x` convention in your alt_names depending on your needs. You can also add or delete alt_names as necessary.

Creating a Root Authority
--------------------
The root key is used to sign certificate requests, so keep it safe. If you want to create a key without password protection, you can remove the `-des3` option:

```
openssl genrsa -des3 -out rootCA.key 4096
```

Next, create and self-sign the root certificate, which identifies your root certificate authority (CA). It will be valid for three years. By then, it might be a good idea to check if 4096 bits is still secure enough for your needs. If you want to change this behavior, alter or remove the `-days 1095` option:

```
openssl req -new -x509 -key rootCA.key -out rootCA.crt -days 1095
```

Creating a Server Certificate
--------------------
In order to create the certificate for the server to use, you'll start by leveraging the configuration file you created to build a certificate signing request (CSR) and private key. The private key is generated through the following:

```
openssl genrsa -out server.key 4096
```

Next, you can create the certificate signing request:

```
openssl req -new -key server.key -out server.csr -config config.cnf
```

Finally, you can generate the server certificate:

```
openssl x509 -req -days 365 -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -extensions req_ext -extfile config.cnf
```

Configuring with Foundation
------------------------------------
To use the generated files with Foundation, copy the server key, the server certificate, and the root certificate to the './certificates' folder. Then set the following options in the config.js file:

```
config.tls.ca = 'rootCA.crt';
config.tls.key = 'server.key';
config.tls.cert = 'server.crt';
```

Using TLS with Ports
-----------------------
In order to enable TLS/SSL on any established port, start by setting the `ports[x].ssl` flag in the pool configuration to `true`. This will only allow miners to connect and start mining on that port using a TLS connection.
