function C=KKmeans(X,k,kernel,c);
% [C,mu]=KKmeans(X,k);
%
%   Kernel K-means clustering algorithm (non-linear).
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% k: the number of clusters
% kernel: the type of kernel K ('gaussian', 'polynomial')
% c: A parameter for the kernel
%
% C:  the assignments of each element to its class
%
% Ex:
%  h=-1:0.1:1; h=h';
%  X(1:21,:)=[h,sqrt(1-h.^2)]
%  X(22:42,:)=[h,-sqrt(1-h.^2)]
%  h=-0.1:0.01:0.1; h=h';
%  X(43:63,:)=[h,sqrt(0.1^2-h.^2)]
%  X(64:84,:)=[h,-sqrt(0.1^2-h.^2)]
%  C=KKmeans(X,2,'gaussian',0.3);
%
% See: Kmeans, WKKmeans

% David Gavilan. 05/07/06

if nargin<3
    kernel='gaussian';
    c=1;
elseif nargin<4
    c=1;
end

[n,d]=size(X);

% center the data
mu=mean(X);
X = X - ones(n, 1) * mu;

% Compute the kernel
K=eval(sprintf('K%s(X,c)',kernel));


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
        s=sum(sel)*2*sum(members);
        s=s-sum(sum((members*ones(1,n))'.*sel));
                
        dist(1:n,i)=s';
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