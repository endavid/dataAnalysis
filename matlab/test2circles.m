function test2circles;
% JACE, Just Another Clustering Example

% generate 2 circles + random noise
% The noise will appear greater in the smaller circle

% noise amplitude
A=0.05;
% circle radius
r1=1; r2=0.1;

h=-1:0.1:1; h=h';
X(1:21,:)=[h,sqrt(r1^2-h.^2)];
X(22:42,:)=[h,-sqrt(r1^2-h.^2)];
h=-0.1:0.01:0.1; h=h';
X(43:63,:)=[h,sqrt(r2^2-h.^2)];
X(64:84,:)=[h,-sqrt(r2^2-h.^2)];

X=X+2*A*rand(84,2)-A;
plot(X(:,1),X(:,2),'.');
title('data');

figure, Kmeans(X,2);
title('K-means');

figure, KKmeans(X,2,'gaussian',0.3);
title('Kernel K-means');

K=Kgaussian(X,0.3);
figure, WKKmeans(X,2,K,ones(84,1)); % == KKmeans
title('Weighted Scatter, 1');

figure, WKKmeans(X,2,K,2*abs(sin(-1:2/83:1))');
title('Weighted Scatter, sin');

W=Kneighbors(K,7); % sparse, symmetric weight matrix
figure, NCuts(X,2,W,'WS');
title('N-Cuts, WS');

figure, NCuts(X,2,W,'spectral');
title('N-Cuts, spectral');

G=KPCA(X,1,'gaussian',0.2);
figure, C=Kmeans(G,2);
plotClusters(X,C);
title('Kernel PCA + K-means');
