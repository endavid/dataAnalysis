function C=WKKmeans(X,k,K,D);
% [C,mu]=KKmeans(X,k,K,D);
%
%   Weighed Kernel K-means clustering algorithm (non-linear).
%
%   Center the data and compute K before calling this function.
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% k: the number of clusters
% K: the kernel (see Kgaussian, Kpolynomial)
% D: a positive weight for each sample (n x 1)
%
% C:  the assignments of each element to its class
%
% Ex: test2circles;
%
% See: KKmeans, Kmeans

% David Gavilan. 05/07/06

[n,d]=size(X);


% randomly initialize partition
C=floor(k*rand(n,1))+1;


% update class assignments until convergence
e=1;
maxiter=100;
iter=0;
while (e>0 & iter<maxiter)
    % compute the distances
    for i=1:k
        members=(C==i);
        sel=(members*ones(1,n)).*K;
        selD=D.*members;
        s=(sel'*selD)*2*sum(selD);
        s=s-sum(sum(((members*ones(1,n))'.*sel).*(D*D')));
                
        dist(1:n,i)=s;
    end    
    if (d<3)
        plotClusters(X,C);
        waitforbuttonpress;
    end
    
    % argmax
    [Y,I]=max(dist,[],2);
    e=n-sum(C==I);
    C=I;
    iter=iter+1;
end

iter