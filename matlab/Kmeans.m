function [C,mu]=Kmeans(X,k,ini);
% [C,mu]=Kmeans(X,k);
%
%   K-means clustering algorithm.
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% k: the number of clusters
% ini: an optional initial cluster assignment
%
% C:  the assignments of each element to its class
% mu: the cluster centers (k x d matrix)
%
% Ex:
%  X=0:0.1:2*pi;
%  X=X';
%  X(:,2)=sin(X);
%  [C,mu]=Kmeans(X,2); 
%
% See: cskmeans, KKmeans, WKKmeans

% David Gavilan. 05/07/06

[n,d]=size(X);
% randomly initialize partition or use initial assignments
if (nargin<3) 
    C=floor(k*rand(n,1))+1;
else 
    C=ini;
end
% update class assignments until convergence
e=1;
maxiter=100;
iter=0;
show=0;
while (e>0 & iter<maxiter)
    % compute the means and the distances
    for i=1:k
        members=(C==i);
        sel=(members*ones(1,d)).*X;
        sn = sum(members);
        if (sn>0)
            mu(i,:)=sum(sel)/sn;
        else
            mu(i,:)=0;
        end
                
        dist(1:n,i)=sum((X-ones(n, 1)*mu(i,:)).^2,2);
    end
    if (d<3 & show==1)
        plotClusters(X,C);
        hold on;
        
        % plot the centers too
        if (d==2)
            plot(mu(:,1),mu(:,2),'x','Color',[0.2 0.2 0.2]);
        else 
            %plot(mu,0,'x','Color',[0.2 0.2 0.2]);
            plot(mu,'x','Color',[0.2 0.2 0.2]);            
        end
        hold off;
        waitforbuttonpress;
    end
    % argmin
    [Y,I]=min(dist,[],2);
    e=n-sum(C==I);
    C=I;
    iter=iter+1;
end

iter